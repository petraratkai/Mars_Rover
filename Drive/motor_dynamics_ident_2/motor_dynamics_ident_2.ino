/*
 * Program written by Yue Zhu (yue.zhu18@imperial.ac.uk) in July 2020.
 * pin6 is PWM output at 62.5kHz.
 * duty-cycle saturation is set as 2% - 98%
 * Control frequency is set as 1.25kHz. 
*/

#include <Wire.h>
#include <INA219_WE.h>

INA219_WE ina219; // this is the instantiation of the library for the current sensor

float open_loop, closed_loop; // Duty Cycles
float vpd,vb,vref,iL,dutyref,current_mA; // Measurement Variables
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
boolean CL_mode = 0;


unsigned int loopTrigger;
unsigned int com_count=0;   // a variables to count the interrupts. Used for program debugging.


//************************** Motor Constants **************************//
unsigned long previousMillis = 0; //initializing time counter
const long f_i = 10000;           //time to move in forward direction, please calculate the precision and conversion factor
const long r_i = 20000;           //time to rotate clockwise
const long b_i = 30000;           //time to move backwards
const long l_i = 40000;           //time to move anticlockwise
const long s_i = 50000;    
int DIRRstate = LOW;              //initializing direction states
int DIRLstate = HIGH;

int DIRL = 20;                    //defining left direction pin
int DIRR = 21;                    //defining right direction pin

int pwmr = 5;                     //pin to control right wheel speed using pwm
int pwml = 9;                     //pin to control left wheel speed using pwm
//*******************************************************************//




void setup() {

  //************************** Motor Pins Defining **************************//
  pinMode(DIRR, OUTPUT);
  pinMode(DIRL, OUTPUT);
  pinMode(pwmr, OUTPUT);
  pinMode(pwml, OUTPUT);
  digitalWrite(pwmr, HIGH);       //setting right motor speed at maximum
  digitalWrite(pwml, HIGH);       //setting left motor speed at maximum
  //*******************************************************************//

  //Basic pin setups
  
  noInterrupts(); //disable all interrupts
  pinMode(13, OUTPUT);  //Pin13 is used to time the loops of the controller
  pinMode(3, INPUT_PULLUP); //Pin3 is the input from the Buck/Boost switch
  pinMode(2, INPUT_PULLUP); // Pin 2 is the input from the CL/OL switch
  analogReference(EXTERNAL); // We are using an external analogue reference for the ADC

  // TimerA0 initialization for control-loop interrupt.
  
  TCA0.SINGLE.PER = 999; //
  TCA0.SINGLE.CMP1 = 999; //
  TCA0.SINGLE.CTRLA = TCA_SINGLE_CLKSEL_DIV16_gc | TCA_SINGLE_ENABLE_bm; //16 prescaler, 1M.
  TCA0.SINGLE.INTCTRL = TCA_SINGLE_CMP1_bm; 

  // TimerB0 initialization for PWM output
  
  pinMode(6, OUTPUT);
  TCB0.CTRLA=TCB_CLKSEL_CLKDIV1_gc | TCB_ENABLE_bm; //62.5kHz
  analogWrite(6,120); 

  interrupts();  //enable interrupts.
  Wire.begin(); // We need this for the i2c comms for the current sensor
  ina219.init(); // this initiates the current sensor
  Wire.setClock(700000); // set the comms speed for i2c
  
}

 void loop() {
  unsigned long currentMillis = millis();
  if(loopTrigger) { // This loop is triggered, it wont run unless there is an interrupt
    
    digitalWrite(13, HIGH);   // set pin 13. Pin13 shows the time consumed by each control cycle. It's used for debugging.
    
    // Sample all of the measurements and check which control mode we are in
    sampling();
    CL_mode = digitalRead(3); // input from the OL_CL switch
    Boost_mode = digitalRead(2); // input from the Buck_Boost switch
   
    // Closed Loop Buck
    // The closed loop path has a voltage controller cascaded with a current controller. The voltage controller
    // creates a current demand based upon the voltage error. This demand is saturated to give current limiting.
    // The current loop then gives a duty cycle demand based upon the error between demanded current and measured
    // current
    current_limit = 3; // Buck has a higher current limit
    ev = vref - vb;  //voltage error at this time
    cv=pidv(ev);  //voltage pid
    cv=saturation(cv, current_limit, 0); //current demand saturation
    ei=cv-iL; //current error
    closed_loop=pidi(ei);  //current pid
    closed_loop=saturation(closed_loop,0.99,0.01);  //duty_cycle saturation
    pwm_modulate(closed_loop); //pwm modulation

    digitalWrite(13, LOW);   // reset pin13.
    loopTrigger = 0;
  }
  
  //************************** Motor Testing **************************//
  //this part of the code decides the direction of motor rotations depending on the time lapsed. currentMillis records the time lapsed once it is called.
  
  //moving forwards
  if (currentMillis < f_i) {
    DIRRstate = HIGH;
    DIRLstate = LOW;
    
  }
  //rotating clockwise
  if (currentMillis > f_i && currentMillis <r_i) {
    DIRRstate = HIGH;
    DIRLstate = HIGH;
    
  }

  //moving backwards
  if (currentMillis > r_i && currentMillis <b_i) {
    DIRRstate = LOW;
    DIRLstate = HIGH;
    
  }
  //rotating anticlockwise
  if (currentMillis > b_i && currentMillis <l_i) {
    DIRRstate = LOW;
    DIRLstate = LOW;
    
  }

  //set your states
  if (currentMillis > l_i) {
    DIRRstate = LOW;
    DIRLstate = LOW;
    
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
  vref = sensorValue2 * (4.096 / 1023.0); // Convert the Vref sensor reading to volts
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


/*end of the program.*/
