function [X, Theta] = generar_proceso_sinusoidal(M, t, A, f0, seed)
% GENERAR_PROCESO_SINUSOIDAL Genera un ensamble de realizaciones de portadora
% con fase aleatoria uniforme: X(t) = A * cos(2*pi*f0*t + Theta)
%
% Entradas:
%   M     - Numero de realizaciones (trayectorias del ensamble)
%   t     - Vector de instantes de tiempo [1 x N]
%   A     - Amplitud de la senal [V]
%   f0    - Frecuencia de portadora [Hz]
%   seed  - Semilla del generador pseudoaleatorio (opcional)
%
% Salidas:
%   X     - Matriz de realizaciones [M x N]
%   Theta - Vector de fases generadas [M x 1] ~ U(0, 2*pi)

    if nargin >= 5 && ~isempty(seed)
        rng(seed);
    end
    
    % Muestreo de la variable aleatoria Theta ~ Uniforme(0, 2*pi)
    Theta = 2 * pi * rand(M, 1);
    
    % Construccion vectorizada de la matriz de realizaciones:
    % t es [1 x N], Theta es [M x 1] -> argumento matricial [M x N]
    fase_total = 2 * pi * f0 * t + Theta;
    X = A * cos(fase_total);
end
