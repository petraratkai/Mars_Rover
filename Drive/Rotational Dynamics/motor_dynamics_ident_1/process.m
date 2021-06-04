clear
close all
clc

D = readmatrix("test1.csv");
pos_x = D(:, 1).';
v = [4*ones(1, 108), zeros(1, 967)]; 
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

figure
hold on
set(gca, 'fontsize', 12)
yyaxis left
plot(t, dx_mean);

xlim([1000 1600]);
title("Free Response X-axis")

ylabel("Time-Averaged Velocity (pixels/cycle)")
xlabel("Time (cycles)")

yyaxis right
ylabel("Voltage (V)")
plot(t, v);

hold off
saveas(gcf, "x_free_response.jpg")