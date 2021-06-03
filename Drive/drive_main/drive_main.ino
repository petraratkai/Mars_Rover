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

#include "drive_motor.hpp"
#include "drive_ofs.hpp"
#include "drive_smps.hpp"


//************************** SMPS **************************//
INA219_WE ina219; // this is the instantiation of the library for the current sensor

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
//*******************************************************************//

//************************ Control Variables ***************************//
enum command_state {rover_standby, rover_move, rover_rotate, rover_stop};

command_state current_command_state = rover_standby;
float target_dist = 0; // in mm
long int target_pixel_dist = 0;
float target_angle = 0; // in degrees
int target_x_pixel_change = 0; // in pixels, converted from the target angle

// PID
float e1 = 0; // dy controller
float acc1 = 0;

float e2 = 0;
float acc2 = 0; // dx controller

const float y_kp = 0.003; // P gain of the y controller (forward distance)
const float x_kp = 0.004; // P gain of the x controller (angle)

float max_vref = 4;

const short int endpoint_beta = 3; // Tolerance of commands at the endpoint before returning to standby
const short int endpoint_time_delta = 100; // Time (in control loop cycles) for which the endpoint needs to be reached before standby
short int endpoint_cycles_elapsed = 0;

short int stop_cycles_elapsed = 0; // Timer. Wait 'endpoint_cycles_elapsed' before returning errors via control link, after the rover has received a stop command
bool return_error_due = false;
bool return_success_due = false;


drive_motor motor;
drive_ofs ofs;
drive_smps smps;
//**********************************************************************//

// Control link
const byte received_data_length = 32;
char received_data[received_data_length];


void setup() {
  smps.setup();
  motor.setup();     
  ofs.setup();

  Serial1.begin(9600); // UART connection for the control link
}
 
bool t = true;
bool t2 = true;

void loop() {
  unsigned long currentMillis = millis(); // Slower due to TCA0?
  if(loopTrigger) { // 1000/1024 kHz, set by TCA0
    loopTrigger = 0;
    
    smps.update(); // ------------- Update SMPS ------------//

    MD md; // ------------Update OFS ---------------//
    ofs.update(&md);

    float target_dy;
    float target_dx;
    float v1;
    float v2;
    const float Vt = 1; // Minimum voltage for motor rotation
    String incoming_command = "";
    switch(current_command_state){
      case rover_standby:
        smps.vref = max_vref;
        if (stop_cycles_elapsed < endpoint_time_delta){ // Delay progression of the state machine to give time for the rover to stop moving
          stop_cycles_elapsed++;
        }
        else{
          if(return_error_due){
            Serial1.println("driveFail");
            Serial1.println((target_pixel_dist - ofs.total_y1)/(15.748f)); // Send the error in mm from the expected endpoint
            Serial1.println((target_x_pixel_change - ofs.total_x1)/(38.0f)); // Send the error in degrees
            return_error_due = false;
          }
          if(return_success_due){
            Serial1.println("driveDone"); // Lets the control system know the rover is in standby and available for new commands
            return_success_due = false;
          }

          if (Serial1.available() > 0){
            // CHECK FOR INCOMING COMMANDS AND MOVE TO APPROPRIATE STATE
            incoming_command = Serial1.readStringUntil(':');
            if (incoming_command == "rotate"){
              roverRotate(Serial1.parseFloat());
            } else if (incoming_command == "drive"){
              roverMove(Serial1.parseFloat());
            } else {
              // RETURN ERROR
            }
          }
        }
        break;

      case rover_move:
        if (roverUpdate()){
          roverStandby();
        }
        if (checkStop()){
          roverStandby();
        }
        break;

      case rover_rotate:
        if (roverUpdate()){
          roverStandby();
        }
        if (checkStop()){
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
  
  if (currentMillis < f_i) {
    roverStandby();
  }

  if (currentMillis > f_i && currentMillis <r_i) {
    if (t){
      roverRotate(-90.0f);
      t = false;
    }
  }

  if (currentMillis > r_i && currentMillis <b_i) {
    roverStandby();
  }

  if (currentMillis > b_i && currentMillis <l_i) {
    roverStandby();
  }

  if (currentMillis > l_i) {
    roverStandby();
  }

  motor.update(); 
  //*******************************************************************//
}


// Timer A CMP1 interrupt. Every 800us the program enters this interrupt. 
// This, clears the incoming interrupt flag and triggers the main loop.
ISR(TCA0_CMP1_vect){
  TCA0.SINGLE.INTFLAGS |= TCA_SINGLE_CMP1_bm; //clear interrupt flag
  loopTrigger = 1;
}

//************************* Rover Commands ************************//

// Switches the drive system to the rover_standby state
void roverStandby(){
  current_command_state = rover_standby;
  target_dist = 0;
  target_angle = 0;
  motor.stopMotors();
  ofs.clear();
}

// Switches the drive system to the rover_move state
void roverMove(float dist){
  current_command_state = rover_move;
  target_dist = dist;
  target_pixel_dist = (long int)(dist*15.748);
  target_x_pixel_change = 0;
  if (dist > 0){
    motor.setMotorDirection(fwd);
  } else {
    motor.setMotorDirection(bck);
  }
  ofs.clear();
}

// Switches the drive system to the rover_rotate state
void roverRotate(float angle){
  current_command_state = rover_rotate;
  target_dist = 0;
  target_angle = angle;
  target_x_pixel_change = (int)(angle*40.0f);
  if (angle > 0){
    motor.setMotorDirection(ccw);
  } else {
    motor.setMotorDirection(cw);
  }
  ofs.clear();
}

bool roverUpdate(){
  float target_dy; // Intermediate PID values used in the control 
  float target_dx;

  float v1;
  float v2;

  smps.vref = max_vref;

  long int y_diff = target_pixel_dist - ofs.total_y1;
  long int x_diff = target_x_pixel_change - ofs.total_x1;

  if (abs(y_diff) <= endpoint_beta){ // Check if the enpoint has been reached to a satisfactory accuracy
    if (abs(x_diff) <= endpoint_beta){
      if (endpoint_cycles_elapsed == endpoint_time_delta){ // Ensure endpoint has been met for a minimum time, avoid overshoot incorrectly identified as endpoint
        endpoint_cycles_elapsed = 0;
        return_success_due = true;
        return true;
      }
      endpoint_cycles_elapsed++;
    }
  } else {
    endpoint_cycles_elapsed = 0;
  }
        
  target_dy = y_kp*(y_diff); // P controller for y
  target_dx = x_kp*(x_diff); // P controller to maintain straight line

  // Limit the speed setpoint to 3 pixels/cycle which is close to the maximum of the rover. Helps to avoid overshoot of endpoint (waste of power)
  if (abs(target_dy) > 3){
    target_dy = (target_dy > 0) ? 3 : -3;
  }
  if (abs(target_dx) > 3){
    target_dx = (target_dx > 0) ? 3 : -3;
  }

  v1 = pid_update(ofs.getAvgdy(), target_dy, &e1, dykp, dyki, dykd, &acc1); // velocity PID controllers
  v2 = pid_update(ofs.getAvgdx(), target_dx, &e2, dxkp, dxki, dxkd, &acc2); // Return value in volts 

  motor.setMotorDelta((int)(v1/smps.vref*255), (int)(2*v2/smps.vref*255)); // Voltage setpoint is converted to a PWM value on the motors
  return false;
}

//****************************************************************//

//----------------------------- Control Connection -----------------------------//

bool checkStop(){ // Checks serial buffer for the STOP instruction
  if (Serial1.available() > 0){
    if (Serial1.readString() == "stop"){
      return_error_due = true;
      stop_cycles_elapsed = 0;
      return true;
    }
  }
  return false;
}

/*
void readToBuffer(){ // Read in new data from Serial1 to the received_data buffer
  char end = '\n';
  char c;
  short int i = 0;

  while (Serial1.available() > 0){
    c = Serial1.read();

    if (c != end){
      received_data[i] = c;
      i = (i >= received_data_length - 1) ? i : i + 1;
    } else {
      received_data[i] = '\0'; // Null-terminated string
      i = 0;
    }
  }
}
*/

bool checkCurrentLimit(){
  // CHECK FOR HIGH CURRENT (e.g. motors have been stopped) 
  // return an error to control and move to standby
  return false;
}
//------------------------------------------------------------------------------//
