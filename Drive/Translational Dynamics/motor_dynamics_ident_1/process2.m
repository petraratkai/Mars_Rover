clear
close all
clc

D = readmatrix("test3.csv");
pos_y = D(:, 2).';
v = [4*ones(1, 108), zeros(1, 965)]; 
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

figure
hold on
plot(t, dy_mean);
plot(t, v);
xlim([1000 1800]);
hold off