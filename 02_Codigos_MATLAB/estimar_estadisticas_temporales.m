function [mu_temp, var_temp, R_temp, lags_temp] = estimar_estadisticas_temporales(x_single, t_single, max_lag_sec)
% ESTIMAR_ESTADISTICAS_TEMPORALES Calcula los promedios temporales de una
% unica trayectoria continua/discreta para verificar ergodicidad.
%
% Entradas:
%   x_single    - Vector con una sola realizacion del proceso [1 x N]
%   t_single    - Vector temporal correspondiente [1 x N]
%   max_lag_sec - Retardo maximo a computar en segundos (opcional)
%
% Salidas:
%   mu_temp     - Media temporal escalar: <x(t)>
%   var_temp    - Varianza temporal escalar: <(x(t) - <x>)^2>
%   R_temp      - Funcion de autocorrelacion temporal: R_x(tau)
%   lags_temp   - Vector de retardos temporales tau [s]

    N = length(x_single);
    dt = t_single(2) - t_single(1);
    
    % Media temporal discretizada:
    % <x(t)> = (1 / T) \int_0^T x(t) dt \approx (1 / N) \sum_{n=1}^N x[n]
    mu_temp = mean(x_single);
    
    % Varianza temporal:
    var_temp = var(x_single, 1); % Normalizado por N para consistencia temporal
    
    % Limite de retardos para calculo
    if nargin < 3 || isempty(max_lag_sec)
        max_lag_samples = round(N / 4);
    else
        max_lag_samples = round(max_lag_sec / dt);
    end
    
    % Estimacion insesgada de la autocorrelacion temporal mediante xcorr:
    % normalizacion 'unbiased' divide cada suma por (N - |k|)
    [R_raw, lags_idx] = xcorr(x_single, max_lag_samples, 'unbiased');
    
    R_temp = R_raw;
    lags_temp = lags_idx * dt;
end
