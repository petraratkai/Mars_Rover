#include <Arduino.h>

#include "drive_motor.hpp"

void drive_motor::setMotorDirection(motor_dir dir){
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
    DIRLstate = LOW;
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
