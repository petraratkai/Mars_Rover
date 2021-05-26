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
float target_angle = 0; // in degrees
int target_x_change = 0; // in pixels, converted from the target angle

drive_motor motor;
drive_ofs ofs;
drive_smps smps;
//**********************************************************************//


void setup() {
  smps.setup();
  motor.setup();     
  ofs.setup();
}
 
bool t = true;
bool t2 = true;

void loop() {
  unsigned long currentMillis = millis(); // Slower due to TCA0?
  if(loopTrigger) { // 1000/1024 kHz, set by TCA0
    loopTrigger = 0;
    
    smps.update();

    // ------------Update OFS ---------------//
    MD md;
    ofs.update(&md);
    //---------------------------------------//

    switch(current_command_state){
      case rover_standby:
        smps.vref = 1;
        break;
      case rover_move:
        smps.vref = 1.5 + 0.005*(target_dist - ofs.total_y); // reduced accuracy
        motor.setMotorDelta(5*ofs.total_x1);
        if ((target_dist - ofs.total_y) < 1){
          roverStandby();
        }
        break;
      case rover_rotate:
        smps.vref = 1.5 + 0.005*(target_x_change - ofs.total_x1);
        motor.setMotorDelta(5*ofs.total_y1);
        if ((target_x_change - ofs.total_x1) < 1){
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
      roverRotate(45.0f);
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
  target_angle = 0;
  if (dist > 0){
    motor.setMotorDirection(fwd);
  } else {
    motor.setMotorDirection(bck);
  }
  motor.setMotorDelta(0);
  // ADD output of totals before clearing them in case the command is interrupting something prematurely
  // output_distance_heading()
  ofs.clear();
}

// Switches the drive system to the rover_rotate state
void roverRotate(float angle){
  current_command_state = rover_rotate;
  target_dist = 0;
  target_angle = angle;
  target_x_change = (int)(angle*41.1f);
  if (angle > 0){
    motor.setMotorDirection(ccw);
  } else {
    motor.setMotorDirection(cw);
  }
  motor.setMotorDelta(0);
  ofs.clear();
}

//****************************************************************//
