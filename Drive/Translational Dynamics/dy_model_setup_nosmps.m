clear
close all
clc

Kp = 1; % HOW TO CONVERT THIS TO GAINS FOR ACTUAL CONTROLLER?
Ki = 12;
Kd = 0.02;

% Motor values
m_zeta = 0.7;
m_w = 30;
m_mu = 624;

smps_zeta = 0.215;
smps_w = 47.12;