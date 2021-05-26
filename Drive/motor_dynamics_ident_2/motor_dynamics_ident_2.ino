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
unsigned long previousMillis = 0;
const long f_i = 1000;           
const long r_i = 1500;           
const long b_i = 1510;           
const long l_i = 2010;           
const long s_i = 3000;    
//*******************************************************************//

//************************ Control Variables ***************************//
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

    MD md;
    ofs.update(&md);

    if (currentMillis > f_i && currentMillis < s_i) {
      String dataString = String(ofs.total_x1) + ", " + String(ofs.total_y1) + ", "+ String(currentMillis);
      Serial.println(dataString);
    }
  }
  
  //************************** Motor Testing **************************//
  
  if (currentMillis < f_i) {
    smps.vref = 4;
    motor.setMotorDirection(fwd);
    motor.stopMotors();
  }
  if (currentMillis > f_i && currentMillis <r_i) {
    digitalWrite(pwmr, HIGH);
    digitalWrite(pwml, HIGH);
  }

  if (currentMillis > r_i && currentMillis <b_i) {
    motor.stopMotors();
    motor.setMotorDirection(bck)
  }

  if (currentMillis > b_i && currentMillis <l_i) {
    digitalWrite(pwmr, HIGH);
    digitalWrite(pwml, HIGH);
  }

  if (currentMillis > l_i) {
    motor.stopMotors();
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
