function [Y, mu_Y, var_Y, t, R_Y_mat, W, var_W] = simular_contraejemplo(M, t, A, f0, alpha_ramp, seed)
% SIMULAR_CONTRAEJEMPLO Modela procesos estocasticos no estacionarios para
% contrastar con el caso estacionario (WSS) y analizar las causas de falla.
%
% Modelos implementados:
%   1. Portadora con envolvente creciente en el tiempo:
%      Y(t) = A * (1 + alpha * t) * cos(2*pi*f0*t + Theta)
%   2. Caminata aleatoria discreta (Random Walk / Modelo de Ruido de Fase):
%      W[n] = sum_{k=1}^n Z[k], Z[k] ~ N(0, sigma^2)
%
% Entradas:
%   M          - Numero de realizaciones
%   t          - Vector temporal [1 x N]
%   A          - Amplitud nominal
%   f0         - Frecuencia nominal [Hz]
%   alpha_ramp - Pendiente de crecimiento temporal [s^-1]
%   seed       - Semilla pseudoaleatoria
%
% Salidas:
%   Y          - Matriz de realizaciones del proceso no estacionario [M x N]
%   mu_Y       - Media de conjunto estimada de Y(t) [1 x N]
%   var_Y      - Varianza de conjunto estimada de Y(t) [1 x N]
%   t          - Vector de tiempo
%   R_Y_mat    - Matriz de autocorrelacion de conjunto [N x N]
%   W          - Matriz de caminatas aleatorias [M x N]
%   var_W      - Varianza de conjunto de la caminata aleatoria [1 x N]

    if nargin >= 6 && ~isempty(seed)
        rng(seed + 100);
    end
    
    N = length(t);
    Theta = 2 * pi * rand(M, 1);
    
    % Proceso 1: Modulacion de amplitud temporal no estacionaria
    envolvente = 1 + alpha_ramp * t; % Vector [1 x N]
    fase_total = 2 * pi * f0 * t + Theta; % Matriz [M x N]
    
    % Multiplicacion elemento a elemento de la envolvente dependiente de t
    Y = (A .* repmat(envolvente, M, 1)) .* cos(fase_total);
    
    % Estadisticas de conjunto de Y(t)
    mu_Y = mean(Y, 1);
    var_Y = var(Y, 0, 1);
    R_Y_mat = (Y' * Y) / M;
    
    % Proceso 2: Caminata aleatoria (Random Walk)
    sigma_step = 0.1;
    pasos = sigma_step * randn(M, N);
    W = cumsum(pasos, 2);
    var_W = var(W, 0, 1);
end
