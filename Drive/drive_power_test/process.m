clear
close all
clc

D = readmatrix("225x1.csv");
i = D(:, 1);
v = D(:, 2);
t = D(:, 3);
p = v.*i; % generator convention out of B terminal of SMPS
p_mean = movmean(p, 5);

real_t = t./1024 %convert the unit in cycles to seconds

figure
hold on
plot(t, p)
hold off

figure
hold on
plot(t, p_mean)
hold off

figure
hold on
plot(real_t, p_mean)
hold off

total_energy = trapz(real_t, p_mean)