#include <Arduino.h>

#include "drive_motor.hpp"

void drive_motor::setMotorDirection(motor_dir dir){
switch (dir)
  {
  case fwd:
    DIRRstate = HIGH;
    DIRLstate = LOW;
    break;

  case bck:
    DIRRstate = LOW;
    DIRLstate = HIGH;
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

void drive_motor::setup(){
    pinMode(DIRR, OUTPUT);
    pinMode(DIRL, OUTPUT);
    pinMode(pwmr, OUTPUT);
    pinMode(pwml, OUTPUT);
    analogWrite(pwmr, 0);       
    analogWrite(pwml, 0);  
}

float pid_update(float in, float setpoint, float *e1, const float kp, const float ki, const float kd, float *acc){
  float e = setpoint - in;
  *acc =  *acc + e*0.001024;
  float o = kp*e + ki*(*acc) + kd*(e - *e1)/0.001024; // dt = 0.001024s due to control frequency
  *e1 = e;
  return o;
}
