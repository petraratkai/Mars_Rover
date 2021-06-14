clear
close all
clc

%e = [3.0552, 4.4828, 5.0249, 6.0583, 7.3645, 8.5834, 9.3343];
%d = [100, 200, 300, 400, 500, 600, 700];
e = [2.4387 3.6368 4.8039 5.8716 7.3060];
d = [45 90 135 180 225];

coef = polyfit(d, e, 1); % lobf to data, will reveal constant cost of move command and cost per mm
%x1 = linspace(0, 1000);
x1 = linspace(0, 270);
y1 = polyval(coef, x1);

figure
hold on
set(gca, 'fontsize', 12)
plot(d, e);
ylim([0 10])
plot(x1, y1);
%title("Energy Drawn From SMPS to Move the Rover");
%xlabel("Distance Traveled (mm)")
title("Energy Drawn From SMPS to Rotate the Rover");
xlabel("Angle Rotated (degrees)");
ylabel("Energy (joules)")
legend("data", "lobf", "location", "southeast")
hold off