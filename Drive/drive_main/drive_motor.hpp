#pragma once

#define DIRR 20                //defining right direction pin
#define DIRL 21                   //defining left direction pin

#define pwmr 5                     //pin to control left wheel speed using pwm. Original provided code labelled the wheels in reverse
#define pwml 9                     //pin to control right wheel speed using pwm

const float[3] k1 = {0.21f, 14.3f, 0}; // PID gain values for forward/backward velocity control
const float[3] k2; // PID gain values for angular rate control

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

float i;
void pid_update(float *in, float *out, float *setpoint, float *e1, float *k);
