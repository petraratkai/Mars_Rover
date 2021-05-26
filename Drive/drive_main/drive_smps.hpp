#pragma once

#include <Arduino.h>
#include <INA219_WE.h>

class drive_smps {
    INA219_WE ina219; // this is the instantiation of the library for the current sensor

    float open_loop, closed_loop; // Duty Cycles
    float vpd, vb, iL, dutyref, current_mA; // Measurement Variables

    unsigned int sensorValue0, sensorValue1, sensorValue2, sensorValue3;  // ADC sample values declaration
    float ev=0,cv=0,ei=0,oc=0; //internal signals

    const float Ts=0.0008; //1.25 kHz control frequency. It's better to design the control period as integral multiple of switching period.
    const float kpv=0.05024,kiv=15.78,kdv=0; // voltage pid.

    float u0v, u1v, delta_uv, e0v, e1v, e2v; // u->output; e->error; 0->this time; 1->last time; 2->last last time

    const float kpi=0.02512, kii=39.4, kdi=0; // current pid.

    float u0i, u1i, delta_ui, e0i, e1i, e2i; // Internal values for the current controller

    const float uv_max= 4, uv_min=0; //anti-windup limitation
    const float ui_max= 1, ui_min=0; //anti-windup limitation
    const float current_limit = 3.0;

    const boolean Boost_mode = 0;
    const boolean CL_mode = 1;

    void sampling();
    float saturation( float sat_input, float uplim, float lowlim);
    void pwm_modulate(float pwm_input);
    float pidv( float pid_input);
    float pidi(float pid_input);

public:
    float vref = 2;
    
    void update();
    void setup();
};