clear
close all
clc

Kp = 40; % HOW TO CONVERT THIS TO GAINS FOR ACTUAL CONTROLLER?
Ki = 10;
Kd = 1;

zeta = 0.7;
w_n = 30;
G = tf(624, [1, 2*zeta*w_n, w_n^2]);

C = pid(Kp, Ki, Kd);

L = G*C;

F = feedback(L, 1);

t = 0:0.001:10;
u = [zeros(1, 1000), 3*ones(1, 2000), zeros(1, 1000), -3*ones(1,2000), zeros(1,4001)];

step(F, t)
lsim(F, u, t);
