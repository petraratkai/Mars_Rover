clear
close all
clc

Kp = 0.21; % HOW TO CONVERT THIS TO GAINS FOR ACTUAL CONTROLLER?
Ki = 16;
Kd = 0;

% Motor values
m_zeta = 0.7;
m_w = 30;
m_mu = 624;

smps_zeta = 0.215;
smps_w = 47.12;
