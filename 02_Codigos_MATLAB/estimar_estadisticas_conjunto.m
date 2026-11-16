function [mu_hat, var_hat, R_mat, R_tau, lags_tau] = estimar_estadisticas_conjunto(X, t)
% ESTIMAR_ESTADISTICAS_CONJUNTO Estima la media, varianza y matriz de
% autocorrelacion de conjunto a partir de la matriz de realizaciones X.
%
% Entradas:
%   X       - Matriz de realizaciones [M x N]
%   t       - Vector de instantes de tiempo [1 x N]
%
% Salidas:
%   mu_hat  - Media muestral de conjunto para cada instante [1 x N]
%   var_hat - Varianza muestral de conjunto para cada instante [1 x N]
%   R_mat   - Matriz completa de autocorrelacion de conjunto [N x N]
%   R_tau   - Autocorrelacion promedio en funcion del retardo tau [1 x (2N-1)]
%   lags_tau- Vector de retardos tau en segundos [1 x (2N-1)]

    [M, N] = size(X);
    
    % Estimador insesgado de la media de conjunto:
    % \hat{\mu}_X(t_n) = (1/M) * sum_{m=1}^M X_m(t_n)
    mu_hat = mean(X, 1);
    
    % Estimador insesgado de la varianza de conjunto:
    var_hat = var(X, 0, 1);
    
    % Matriz de autocorrelacion de conjunto:
    % \hat{R}_X(t_i, t_j) = (1/M) * sum_{m=1}^M X_m(t_i) * X_m(t_j)
    % Implementado eficientemente como producto matricial normalizado:
    R_mat = (X' * X) / M;
    
    % Extraccion de la autocorrelacion sobre retardos simetricos
    dt = t(2) - t(1);
    lags_idx = -(N - 1):(N - 1);
    lags_tau = lags_idx * dt;
    
    R_tau = zeros(1, length(lags_idx));
    for k = 1:length(lags_idx)
        diag_offset = lags_idx(k);
        % La diagonal principal y sus paralelas contienen pares con retardo fijo
        elementos_diag = diag(R_mat, diag_offset);
        R_tau(k) = mean(elementos_diag);
    end
end
