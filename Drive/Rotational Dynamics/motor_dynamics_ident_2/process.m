clear
close all
clc

zeta = 1;
w_n = 45;
sys = tf(2000, [1, 2*zeta*w_n, w_n^2]);

D = readmatrix("test2.csv");
pos_x = D(:, 1).';
v = [4*ones(1, 268), zeros(1, 4), -4*ones(1, 266), zeros(1, 511)]; 
t = D(:, 3).';%.*1.024;
dx_dt = gradient(pos_x, t);
dx_mean = movmean(dx_dt, 30); % approximately pixels/ms

figure
hold on
plot(t, pos_x);
hold off

figure
hold on
plot(t, dx_dt);
plot(t, v);
hold off

vsim = [4*ones(1, 500), zeros(1, 10), -4*ones(1, 500), zeros(1, 990)];
tsim = 1:1e-3:2.999;
x = lsim(sys, vsim, tsim);

figure
hold on
plot(t, dx_mean);
plot(t, v);
plot(tsim*1000, x);
xlabel("cycles")
ylabel("dy/cycle")
hold off