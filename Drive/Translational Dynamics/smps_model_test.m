clear
close all
clc

smps_zeta = 0.215;
smps_w = 47.12;

sys = tf(smps_w^2, [1, 2*smps_zeta*smps_w, smps_w^2]);
%sys = tf(10, [1, 2, 11]);

t = 0:0.001:5;
step(sys, t);