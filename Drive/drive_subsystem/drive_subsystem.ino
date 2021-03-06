/*
 * Original SMPS Program written by Yue Zhu (yue.zhu18@imperial.ac.uk) in July 2020.
 * pin6 is PWM output at 62.5kHz.
 * duty-cycle saturation is set as 2% - 98%
 * Control frequency is set as 1.25kHz. 
 * 
 * This program is an adaptation of Yue Zhu's work, combined with the sample code provided for the EE2 Rover.
 * Author, Miles Grist
 * Date, May 2021
 * 
 * This sketch is for an Arduino Nano Every to drive a SMPS, dual H-bridge motor driver and optical flow sensor.
*/

#include "SPI.h"
#include <Wire.h>
#include <INA219_WE.h>

// ------------ PIN DEFINITIONS --------------
#define PIN_SS        10
#define PIN_MISO      12
#define PIN_MOSI      11
#define PIN_SCK       13

#define PIN_MOUSECAM_RESET     8
#define PIN_MOUSECAM_CS        7

#define ADNS3080_PIXELS_X                 30
#define ADNS3080_PIXELS_Y                 30

#define ADNS3080_PRODUCT_ID            0x00
#define ADNS3080_REVISION_ID           0x01
#define ADNS3080_MOTION                0x02
#define ADNS3080_DELTA_X               0x03
#define ADNS3080_DELTA_Y               0x04
#define ADNS3080_SQUAL                 0x05
#define ADNS3080_PIXEL_SUM             0x06
#define ADNS3080_MAXIMUM_PIXEL         0x07
#define ADNS3080_CONFIGURATION_BITS    0x0a
#define ADNS3080_EXTENDED_CONFIG       0x0b
#define ADNS3080_DATA_OUT_LOWER        0x0c
#define ADNS3080_DATA_OUT_UPPER        0x0d
#define ADNS3080_SHUTTER_LOWER         0x0e
#define ADNS3080_SHUTTER_UPPER         0x0f
#define ADNS3080_FRAME_PERIOD_LOWER    0x10
#define ADNS3080_FRAME_PERIOD_UPPER    0x11
#define ADNS3080_MOTION_CLEAR          0x12
#define ADNS3080_FRAME_CAPTURE         0x13
#define ADNS3080_SROM_ENABLE           0x14
#define ADNS3080_FRAME_PERIOD_MAX_BOUND_LOWER      0x19
#define ADNS3080_FRAME_PERIOD_MAX_BOUND_UPPER      0x1a
#define ADNS3080_FRAME_PERIOD_MIN_BOUND_LOWER      0x1b
#define ADNS3080_FRAME_PERIOD_MIN_BOUND_UPPER      0x1c
#define ADNS3080_SHUTTER_MAX_BOUND_LOWER           0x1e
#define ADNS3080_SHUTTER_MAX_BOUND_UPPER           0x1e
#define ADNS3080_SROM_ID               0x1f
#define ADNS3080_OBSERVATION           0x3d
#define ADNS3080_INVERSE_PRODUCT_ID    0x3f
#define ADNS3080_PIXEL_BURST           0x40
#define ADNS3080_MOTION_BURST          0x50
#define ADNS3080_SROM_LOAD             0x60

#define ADNS3080_PRODUCT_ID_VAL        0x17

#define DIRL 20                //defining left direction pin
#define DIRR 21                   //defining right direction pin

#define pwmr 5                     //pin to control right wheel speed using pwm
#define pwml 9                     //pin to control left wheel speed using pwm

// ------------------------------------------

//************************** SMPS **************************//
INA219_WE ina219; // this is the instantiation of the library for the current sensor

float open_loop, closed_loop; // Duty Cycles
float vpd,vb,iL,dutyref,current_mA; // Measurement Variables
float vref = 2;
unsigned int sensorValue0,sensorValue1,sensorValue2,sensorValue3;  // ADC sample values declaration
float ev=0,cv=0,ei=0,oc=0; //internal signals
float Ts=0.0008; //1.25 kHz control frequency. It's better to design the control period as integral multiple of switching period.
float kpv=0.05024,kiv=15.78,kdv=0; // voltage pid.
float u0v,u1v,delta_uv,e0v,e1v,e2v; // u->output; e->error; 0->this time; 1->last time; 2->last last time
float kpi=0.02512,kii=39.4,kdi=0; // current pid.
float u0i,u1i,delta_ui,e0i,e1i,e2i; // Internal values for the current controller
float uv_max=4, uv_min=0; //anti-windup limitation
float ui_max=1, ui_min=0; //anti-windup limitation
float current_limit = 1.0;
boolean Boost_mode = 0;
boolean CL_mode = 1;

unsigned int loopTrigger;
unsigned int com_count=0;   // a variables to count the interrupts. Used for program debugging.
//*********************************************************//


//************************** Motor Constants **************************//
unsigned long previousMillis = 0; //initializing time counter
const long f_i = 2000;           //time to move in forward direction, please calculate the precision and conversion factor
const long r_i = 20000;           //time to rotate clockwise
const long b_i = 30000;           //time to move backwards
const long l_i = 40000;           //time to move anticlockwise
const long s_i = 50000;    
int DIRRstate = LOW;              //initializing direction states
int DIRLstate = HIGH;
//*******************************************************************//

//************************** Optical Flow Sensor **************************//
int total_x = 0; // mm
int total_y = 0; // mm

int total_x1 = 0; // pixels
int total_y1 = 0; // pixels

int x=0;
int y=0;

int a=0;
int b=0;

int distance_x=0;
int distance_y=0;

int tdistance = 0;
  
volatile byte movementflag=0;
volatile int xydat[2];

byte frame[ADNS3080_PIXELS_X * ADNS3080_PIXELS_Y];
//*******************************************************************//

//************************ Control Variables ***************************//
enum command_state {rover_standby, rover_move, rover_rotate, rover_stop};
enum motor_dir {fwd, bck, cw, ccw};

command_state current_command_state = rover_standby;
float target_dist = 0; // in mm
float target_angle = 0; // in degrees
int target_x_change = 0; // in pixels, converted from the target angle
//**********************************************************************//

struct MD{
 byte motion;
 char dx, dy;
 byte squal;
 word shutter;
 byte max_pix;
};

int convTwosComp(int b){
  //Convert from 2's complement
  if(b & 0x80){
    b = -1 * ((b ^ 0xff) + 1);
    }
  return b;
}

void mousecam_reset(){
  digitalWrite(PIN_MOUSECAM_RESET,HIGH);
  delayMicroseconds(50); // reset pulse >10us
  digitalWrite(PIN_MOUSECAM_RESET,LOW);
  delayMicroseconds(3500); // 35ms from reset to functional
}

int mousecam_init(){
  pinMode(PIN_MOUSECAM_RESET,OUTPUT);
  pinMode(PIN_MOUSECAM_CS,OUTPUT);
  
  digitalWrite(PIN_MOUSECAM_CS,HIGH);
  
  mousecam_reset();
  
  int pid = mousecam_read_reg(ADNS3080_PRODUCT_ID);
  if(pid != ADNS3080_PRODUCT_ID_VAL)
    return -1;

  // turn on sensitive mode
  mousecam_write_reg(ADNS3080_CONFIGURATION_BITS, 0x19);
  return 0;
}

void mousecam_write_reg(int reg, int val){
  digitalWrite(PIN_MOUSECAM_CS, LOW);
  SPI.transfer(reg | 0x80);
  SPI.transfer(val);
  digitalWrite(PIN_MOUSECAM_CS,HIGH);
  delayMicroseconds(50);
}

int mousecam_read_reg(int reg){
  digitalWrite(PIN_MOUSECAM_CS, LOW);
  SPI.transfer(reg);
  delayMicroseconds(75);
  int ret = SPI.transfer(0xff);
  digitalWrite(PIN_MOUSECAM_CS,HIGH); 
  delayMicroseconds(1);
  return ret;
}

char asciiart(int k)
{
  static char foo[] = "WX86*3I>!;~:,`. ";
  return foo[k>>4];
}

void mousecam_read_motion(struct MD *p){
  digitalWrite(PIN_MOUSECAM_CS, LOW);
  SPI.transfer(ADNS3080_MOTION_BURST);
  delayMicroseconds(75);
  p->motion =  SPI.transfer(0xff);
  p->dx =  SPI.transfer(0xff);
  p->dy =  SPI.transfer(0xff);
  p->squal =  SPI.transfer(0xff);
  p->shutter =  SPI.transfer(0xff)<<8;
  p->shutter |=  SPI.transfer(0xff);
  p->max_pix =  SPI.transfer(0xff);
  digitalWrite(PIN_MOUSECAM_CS,HIGH); 
  delayMicroseconds(5);
}

// pdata must point to an array of size ADNS3080_PIXELS_X x ADNS3080_PIXELS_Y
// you must call mousecam_reset() after this if you want to go back to normal operation
int mousecam_frame_capture(byte *pdata)
{
  mousecam_write_reg(ADNS3080_FRAME_CAPTURE,0x83);
  
  digitalWrite(PIN_MOUSECAM_CS, LOW);
  
  SPI.transfer(ADNS3080_PIXEL_BURST);
  delayMicroseconds(50);
  
  int pix;
  byte started = 0;
  int count;
  int timeout = 0;
  int ret = 0;
  for(count = 0; count < ADNS3080_PIXELS_X * ADNS3080_PIXELS_Y; )
  {
    pix = SPI.transfer(0xff);
    delayMicroseconds(10);
    if(started==0)
    {
      if(pix&0x40)
        started = 1;
      else
      {
        timeout++;
        if(timeout==100)
        {
          ret = -1;
          break;
        }
      }
    }
    if(started==1)
    {
      pdata[count++] = (pix & 0x3f)<<2; // scale to normal grayscale byte range
    }
  }

  digitalWrite(PIN_MOUSECAM_CS,HIGH); 
  delayMicroseconds(14);
  
  return ret;
}

void setup() {

  //************************** Motor Pins **************************//
  pinMode(DIRR, OUTPUT);
  pinMode(DIRL, OUTPUT);
  pinMode(pwmr, OUTPUT);
  pinMode(pwml, OUTPUT);
  analogWrite(pwmr, 0);       
  analogWrite(pwml, 0);       
  //*******************************************************************//

  //----------------------- SMPS -----------------------------//
  //Basic pin setups
  
  noInterrupts(); //disable all interrupts
  pinMode(3, INPUT_PULLUP); //Pin3 is the input from the Buck/Boost switch
  pinMode(2, INPUT_PULLUP); // Pin 2 is the input from the CL/OL switch
  analogReference(EXTERNAL); // We are using an external analogue reference for the ADC

  //---------------------------------------------------------//

  //++++++++++++++++++++++ Optical Flow Sensor ++++++++++++++//
  pinMode(PIN_SS,OUTPUT);
  pinMode(PIN_MISO,INPUT);
  pinMode(PIN_MOSI,OUTPUT);
  pinMode(PIN_SCK,OUTPUT);
  
  SPI.begin();
  SPI.setClockDivider(SPI_CLOCK_DIV32);
  SPI.setDataMode(SPI_MODE3);
  SPI.setBitOrder(MSBFIRST);
  
  Serial.begin(38400);
  
  if(mousecam_init()==-1)
  {
    Serial.println("Mouse cam failed to init");
    while(1);
  }
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
  
  // TimerA0 initialization for control-loop interrupt.
  
  TCA0.SINGLE.PER = 255;
  TCA0.SINGLE.CMP1 = 255;
  TCA0.SINGLE.CTRLA = TCA_SINGLE_CLKSEL_DIV64_gc | TCA_SINGLE_ENABLE_bm;
  TCA0.SINGLE.INTCTRL = TCA_SINGLE_CMP1_bm; 

  // TimerB0 initialization for PWM output
  
  pinMode(6, OUTPUT);
  TCB0.CTRLA=TCB_CLKSEL_CLKDIV1_gc | TCB_ENABLE_bm; //62.5kHz
  analogWrite(6, 120); 

  interrupts();  //enable interrupts.
  Wire.begin(); // We need this for the i2c comms for the current sensor
  ina219.init(); // this initiates the current sensor
  Wire.setClock(700000); // set the comms speed for i2c
  
}

bool t = true;
bool t2 = true;
void loop() {
  unsigned long currentMillis = millis();
  if(loopTrigger) { // This loop is triggered, it wont run unless there is an interrupt

    sampling();
    current_limit = 3; // Buck has a higher current limit
    ev = vref - vb;  //voltage error at this time
    cv=pidv(ev);  //voltage pid
    cv=saturation(cv, current_limit, 0); //current demand saturation
    ei=cv-iL; //current error
    closed_loop=pidi(ei);  //current pid
    closed_loop=saturation(closed_loop,0.99,0.01);  //duty_cycle saturation
    pwm_modulate(closed_loop); //pwm modulation
    
    loopTrigger = 0;

    // ------------Update OFS ---------------//
    int val = mousecam_read_reg(ADNS3080_PIXEL_SUM);
    MD md;
    mousecam_read_motion(&md);
    /*
    for(int i=0; i<md.squal/4; i++)
      Serial.print('*');
    Serial.print(' ');
    Serial.print((val*100)/351);
    Serial.print(' ');
    Serial.print(md.shutter); Serial.print(" (");
    Serial.print((int)md.dx); Serial.print(',');
    Serial.print((int)md.dy); Serial.println(')');
    */
    // Serial.println(md.max_pix);

    distance_x = md.dx; //convTwosComp(md.dx);
    distance_y = md.dy; //convTwosComp(md.dy);

    total_x1 = (total_x1 + distance_x);
    total_y1 = (total_y1 + distance_y);

    total_x = 10*total_x1/157; //Conversion from counts per inch to mm (400 counts per inch)
    total_y = 10*total_y1/157; //Conversion from counts per inch to mm (400 counts per inch)
  
    //Serial.print('\n');
    //Serial.println("Distance_x = " + String(total_x));
    //Serial.println("Distance_y = " + String(total_y));
    //Serial.print('\n');
    //---------------------------------------//

    switch(current_command_state){
      case rover_standby:
        vref = 1;
        break;
      case rover_move:
        vref = 1.5 + 0.005*(target_dist - total_y); // reduced accuracy
        setMotorDelta(5*total_x1);
        if ((target_dist - total_y) < 1){
          roverStandby();
        }
        break;
      case rover_rotate:
        Serial.println("rotate state");
        vref = 1.5 + 0.005*(target_x_change - total_x1);
        setMotorDelta(5*total_y1);
        if ((target_x_change - total_x1) < 1){
          roverStandby();
        }
        break;
      case rover_stop:
        roverStandby();
        break;
      default:
        roverStandby();
        break;
    }
  }
  
  //************************** Motor Testing **************************//
  //this part of the code decides the direction of motor rotations depending on the time lapsed. currentMillis records the time lapsed once it is called.
  
  //moving forwards
  if (currentMillis < f_i) {
    roverStandby();
  }
  //rotating clockwise
  if (currentMillis > f_i && currentMillis <r_i) {
    if (t){
      roverRotate(90.0f);
      t = false;
    }
  }

  //moving backwards
  if (currentMillis > r_i && currentMillis <b_i) {
    roverStandby();
  }
  //rotating anticlockwise
  if (currentMillis > b_i && currentMillis <l_i) {
    roverStandby();
  }

  //set your states
  if (currentMillis > l_i) {
    roverStandby();
  }

  digitalWrite(DIRR, DIRRstate);
  digitalWrite(DIRL, DIRLstate); 
  //*******************************************************************//
}


// Timer A CMP1 interrupt. Every 800us the program enters this interrupt. 
// This, clears the incoming interrupt flag and triggers the main loop.

ISR(TCA0_CMP1_vect){
  TCA0.SINGLE.INTFLAGS |= TCA_SINGLE_CMP1_bm; //clear interrupt flag
  loopTrigger = 1;
}

// This subroutine processes all of the analogue samples, creating the required values for the main loop

void sampling(){

  // Make the initial sampling operations for the circuit measurements
  
  sensorValue0 = analogRead(A0); //sample Vb
  sensorValue2 = analogRead(A2); //sample Vref
  sensorValue3 = analogRead(A3); //sample Vpd
  current_mA = ina219.getCurrent_mA(); // sample the inductor current (via the sensor chip)

  // Process the values so they are a bit more usable/readable
  // The analogRead process gives a value between 0 and 1023 
  // representing a voltage between 0 and the analogue reference which is 4.096V
  
  vb = sensorValue0 * (4.096 / 1023.0); // Convert the Vb sensor reading to volts
  //vref = sensorValue2 * (4.096 / 1023.0); // Convert the Vref sensor reading to volts
  //vref = 4;
  vpd = sensorValue3 * (4.096 / 1023.0); // Convert the Vpd sensor reading to volts

  // The inductor current is in mA from the sensor so we need to convert to amps.
  // We want to treat it as an input current in the Boost, so its also inverted
  // For open loop control the duty cycle reference is calculated from the sensor
  // differently from the Vref, this time scaled between zero and 1.
  // The boost duty cycle needs to be saturated with a 0.33 minimum to prevent high output voltages
  
  if (Boost_mode == 1){
    iL = -current_mA/1000.0;
    dutyref = saturation(sensorValue2 * (1.0 / 1023.0),0.99,0.33);
  }else{
    iL = current_mA/1000.0;
    dutyref = sensorValue2 * (1.0 / 1023.0);
  }
  
}

float saturation( float sat_input, float uplim, float lowlim){ // Saturatio function
  if (sat_input > uplim) sat_input=uplim;
  else if (sat_input < lowlim ) sat_input=lowlim;
  else;
  return sat_input;
}

void pwm_modulate(float pwm_input){ // PWM function
  analogWrite(6,(int)(255-pwm_input*255)); 
}

// This is a PID controller for the voltage

float pidv( float pid_input){
  float e_integration;
  e0v = pid_input;
  e_integration = e0v;
 
  //anti-windup, if last-time pid output reaches the limitation, this time there won't be any intergrations.
  if(u1v >= uv_max) {
    e_integration = 0;
  } else if (u1v <= uv_min) {
    e_integration = 0;
  }

  delta_uv = kpv*(e0v-e1v) + kiv*Ts*e_integration + kdv/Ts*(e0v-2*e1v+e2v); //incremental PID programming avoids integrations.there is another PID program called positional PID.
  u0v = u1v + delta_uv;  //this time's control output

  //output limitation
  saturation(u0v,uv_max,uv_min);
  
  u1v = u0v; //update last time's control output
  e2v = e1v; //update last last time's error
  e1v = e0v; // update last time's error
  return u0v;
}

// This is a PID controller for the current

float pidi(float pid_input){
  float e_integration;
  e0i = pid_input;
  e_integration=e0i;
  
  //anti-windup
  if(u1i >= ui_max){
    e_integration = 0;
  } else if (u1i <= ui_min) {
    e_integration = 0;
  }
  
  delta_ui = kpi*(e0i-e1i) + kii*Ts*e_integration + kdi/Ts*(e0i-2*e1i+e2i); //incremental PID programming avoids integrations.
  u0i = u1i + delta_ui;  //this time's control output

  //output limitation
  saturation(u0i,ui_max,ui_min);
  
  u1i = u0i; //update last time's control output
  e2i = e1i; //update last last time's error
  e1i = e0i; // update last time's error
  return u0i;
}

//********************** Motor Control Routines ********************//

// sets the direction of the motors to meet a desired movement of the rover
void setMotorDirection(motor_dir dir){
  switch (dir)
  {
  case fwd:
    DIRRstate = LOW;
    DIRLstate = HIGH;
    break;

  case bck:
    DIRRstate = HIGH;
    DIRLstate = LOW;
    break;

  case cw:
    DIRRstate = HIGH;
    DIRLstate = HIGH;
    break;

  case ccw:
    DIRRstate = LOW;
    DIRLstate = LOW;
    break;
  
  default:
    DIRRstate = LOW;
    DIRLstate = HIGH;
    break;
  }
}

// delta represents the difference between the motor pwm, used to account for asymmetry of motors in the control loop
void setMotorDelta(float delta){
  int d = (delta > 110) ? 55 : (int)delta/2; // Limit delta
  analogWrite(pwmr, 200 + d/2);       
  analogWrite(pwml, 200 - d/2);  
}

void stopMotors(){
  analogWrite(pwmr, 0);
  analogWrite(pwml, 0);
}

//******************************************************************//

//************************* Rover Commands ************************//

// Resets totals measured from the optical flow sensor
void clearOFSTotal(){
  total_x1 = 0;
  total_y1 = 0;
  total_x = 0;
  total_y = 0;
}

// Switches the drive system to the rover_standby state
void roverStandby(){
  current_command_state = rover_standby;
  target_dist = 0;
  target_angle = 0;
  stopMotors();
  clearOFSTotal();
}

// Switches the drive system to the rover_move state
void roverMove(float dist){
  current_command_state = rover_move;
  target_dist = dist;
  target_angle = 0;
  if (dist > 0){
    setMotorDirection(fwd);
  } else {
    setMotorDirection(bck);
  }
  setMotorDelta(0);
  // ADD output of totals before clearing them in case the command is interrupting something prematurely
  // output_distance_heading()
  clearOFSTotal();
}

// Switches the drive system to the rover_rotate state
void roverRotate(float angle){
  current_command_state = rover_rotate;
  target_dist = 0;
  target_angle = angle;
  target_x_change = (int)(angle*41);
  if (angle > 0){
    setMotorDirection(ccw);
  } else {
    setMotorDirection(cw);
  }
  setMotorDelta(0);
  clearOFSTotal();
}







//****************************************************************//
