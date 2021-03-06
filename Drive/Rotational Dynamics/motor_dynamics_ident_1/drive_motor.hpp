#pragma once

#define DIRR 20                //defining right direction pin
#define DIRL 21                   //defining left direction pin

#define pwmr 5                     //pin to control left wheel speed using pwm. Original provided code labelled the wheels in reverse
#define pwml 9                     //pin to control right wheel speed using pwm

enum motor_dir {fwd, bck, cw, ccw};

// abstraction of the 2 motors on the EE rover
class drive_motor {
    int DIRRstate;              //initializing direction states
    int DIRLstate;
public:
    drive_motor(): DIRRstate(0), DIRLstate(1) {}

    void setMotorDirection(motor_dir dir);
    void setMotorDelta(float delta);
    void stopMotors();

    void update();
    void setup();
};