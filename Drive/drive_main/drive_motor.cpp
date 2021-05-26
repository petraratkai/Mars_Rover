#include <Arduino.h>

#include "drive_motor.hpp"

void drive_motor::setMotorDirection(motor_dir dir){
switch (dir)
  {
  case fwd:
    DIRRstate = 0;
    DIRLstate = 1;
    break;

  case bck:
    DIRRstate = 1;
    DIRLstate = 0;
    break;

  case cw:
    DIRRstate = 1;
    DIRLstate = 1;
    break;

  case ccw:
    DIRRstate = 0;
    DIRLstate = 0;
    break;
  
  default:
    DIRRstate = 0;
    DIRLstate = 1;
    break;
  }
}

void drive_motor::setMotorDelta(float delta){
    int d = (delta > 110) ? 55 : (int)delta/2; // Limit delta
    analogWrite(pwmr, 200 + d/2);       
    analogWrite(pwml, 200 - d/2);  
}

void drive_motor::stopMotors(){
    analogWrite(pwmr, 0);
    analogWrite(pwml, 0);
}

void drive_motor::update(){
    digitalWrite(DIRR, DIRRstate);
    digitalWrite(DIRL, DIRLstate);
}