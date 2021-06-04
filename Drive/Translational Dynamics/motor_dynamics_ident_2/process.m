clear
close all
clc

zeta = 0.7;
w_n = 30;
sys = tf(624, [1, 2*zeta*w_n, w_n^2]);

D = readmatrix("test1_forced.csv");
pos_y = D(:, 2).';
v = [4*ones(1, 268), zeros(1, 4), -4*ones(1, 266), zeros(1, 532)]; 
t = D(:, 3).';%.*1.024;
dy_dt = gradient(pos_y, t);
dy_mean = movmean(dy_dt, 30); % approximately pixels/ms

figure
hold on
plot(t, pos_y);
hold off

figure
hold on
plot(t, dy_dt);
plot(t, v);
hold off

vsim = [4*ones(1, 500), zeros(1, 10), -4*ones(1, 500), zeros(1, 990)];
tsim = 1:1e-3:2.999;
y = lsim(sys, vsim, tsim);

figure
set(gca, 'fontsize', 12)
hold on

yyaxis left
plot(t, dy_mean);
plot(tsim*1000, y);
ylim([-3.5 3.5])

ylabel("Time-Averaged Velocity (pixels/cycle)")
xlabel("Time (cycles)")

yyaxis right
ylabel("Voltage (V)")
plot(t, v);

legend("Measured", "Simulated", "Setpoint")
title("Forced Doublet Response Y-axis")
hold off

saveas(gcf, "y_forced_response.jpg")