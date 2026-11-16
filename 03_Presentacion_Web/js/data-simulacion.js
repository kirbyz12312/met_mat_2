/**
 * TIF GRUPO 02 - TEMA 08: DATOS CIENTIFICOS Y CODIGOS DE MATLAB
 * Métodos Matemáticos 2 - Universidad Nacional de San Agustín de Arequipa (UNSA)
 */

const SIMULATION_DATA = {
  metadata: {
    universidad: "Universidad Nacional de San Agustín de Arequipa",
    facultad: "Facultad de Ingeniería de Producción y Servicios",
    escuela: "Escuela Profesional de Ingeniería en Telecomunicaciones",
    curso: "Métodos Matemáticos 2 (1702228) — Semestre 2026-B",
    docente: "Mg. Oswaldo René Banda Sayco",
    tema: "Tema 08: Introducción a procesos estocásticos: clasificación, estacionariedad y ergodicidad",
    grupo: "Grupo 02",
    fecha: "Lunes 16 de Noviembre de 2026 (2.º Turno)",
    duracion_minutos: 15,
    preguntas_minutos: 5
  },

  integrantes: [
    { num: "01", nombre: "Franco Arturo Gutiérrez Ccolqque", rol: "Modelado Matemático y SSS/WSS" },
    { num: "02", nombre: "Fernando Gaimez Ollachica", rol: "Simulación Monte Carlo y Convergencia" },
    { num: "03", nombre: "Zaul Francisco Uturunco Cuela", rol: "Análisis de Ergodicidad y Telecomunicaciones" },
    { num: "04", nombre: "Fernando Josue Castro Quispe", rol: "Contraejemplos No Estacionarios y PLL" },
    { num: "05", nombre: "Benjamin Eduardo Quispe Flores", rol: "Estimadores Matriciales e Implementación" }
  ],

  parametros: {
    A: 2.0,            // V
    f0: 1000,          // Hz
    T0: 0.001,         // s (1 ms)
    fs: 20000,         // Hz
    dt: 0.00005,       // s (50 us)
    samples_per_cycle: 20,
    T_obs: 0.005,      // s (5 ms)
    N_samples: 101,
    P_teorica: 2.0,    // W (A^2/2)
    T_long: 1.0,       // s (1000 ciclos)
    N_long: 20001,
    alpha_ramp: 600.0  // s^-1
  },

  metricas_ensamble: [
    { M: "100", mae_mu: "0.071433 V", rmse_R: "0.073234 W", P_est: "2.017319 W", err_rel: "0.8660 %" },
    { M: "1,000", mae_mu: "0.068961 V", rmse_R: "0.003416 W", P_est: "1.995917 W", err_rel: "0.2041 %" },
    { M: "10,000", mae_mu: "0.011112 V", rmse_R: "0.006227 W", P_est: "1.999760 W", err_rel: "0.0120 %" },
    { M: "Teórico", mae_mu: "0.000000 V", rmse_R: "0.000000 W", P_est: "2.000000 W", err_rel: "0.0000 %" }
  ],

  metricas_ergodicidad: {
    media_teorica: "0.000000 V",
    media_conjunto_10k: "0.011112 V",
    media_temporal: "-0.000016 V (-1.55e-5 V)",
    potencia_teorica: "2.000000 W",
    potencia_conjunto_10k: "1.999760 W (Error 0.0120 %)",
    potencia_temporal: "1.999905 W (Error 0.0048 %)",
    rmse_R_temporal: "0.000217 W (2.17e-4 W)"
  },

  metricas_contraejemplo: {
    alpha: "600 s^-1",
    rmse_var: "0.087941 W",
    var_inicial: "1.996111 W (t = 0 ms)",
    var_final: "31.937769 W (t = 5 ms)",
    crecimiento_factor: "16x en 5 periodos"
  },

  codigos: {
    "config_parametros": `function cfg = config_parametros()
% CONFIG_PARAMETROS Parametros globales de simulacion estocastica
% Escuela Profesional de Ingenieria en Telecomunicaciones - UNSA
% Grupo 02 - Tema 08: Introduccion a Procesos Estocasticos

    cfg.seed = 202608;         % Semilla fija para reproducibilidad exacta
    
    % Parametros de la senal sinusoidal con fase aleatoria
    cfg.A = 2.0;               % Amplitud pico [V]
    cfg.f0 = 1000;             % Frecuencia fundamental [Hz] (1 kHz)
    cfg.T0 = 1 / cfg.f0;       % Periodo fundamental [s] (1 ms)
    
    % Discretizacion temporal (Nyquist-Shannon: 20 muestras/ciclo)
    cfg.fs = 20000;            % Frecuencia de muestreo [Hz] (20 kSa/s)
    cfg.dt = 1 / cfg.fs;       % Intervalo de muestreo [s] (50 us)
    
    % Ventana de observacion ensamble (5 periodos)
    cfg.T_obs = 5 * cfg.T0;    % 5 ms
    cfg.t = 0:cfg.dt:cfg.T_obs;% N = 101 muestras
    cfg.N_samples = length(cfg.t);
    
    % Tamanos de ensamble para convergencia Monte Carlo
    cfg.M_pequeno = 100;
    cfg.M_medio   = 1000;
    cfg.M_grande  = 10000;
    
    % Analisis de ergodicidad temporal (1 realizacion larga)
    cfg.T_long = 1.0;          % 1.0 segundo (1000 ciclos de portadora)
    cfg.t_long = 0:cfg.dt:cfg.T_long;
    cfg.N_long = length(cfg.t_long);
    
    % Contraejemplo no estacionario
    cfg.alpha_ramp = 600.0;    % Pendiente de rampa [s^-1]
end`,

    "generar_proceso": `function [X, Theta] = generar_proceso_sinusoidal(M, t, A, f0, seed)
% GENERAR_PROCESO_SINUSOIDAL Modela el ensamble de portadoras
% con fase aleatoria Theta ~ U(0, 2*pi).
%
% Salida matricial vectorizada X [M x N] donde cada fila es una realizacion.

    if nargin >= 5 && ~isempty(seed)
        rng(seed);
    end
    
    % Muestreo uniforme de fase Theta para cada realizacion m = 1..M
    Theta = 2 * pi * rand(M, 1);
    
    % Argumento matricial [M x N] computado de forma 100% vectorizada
    fase_total = 2 * pi * f0 * t + Theta;
    X = A * cos(fase_total);
end`,

    "estimar_conjunto": `function [mu_hat, var_hat, R_mat, R_tau, lags_tau] = estimar_estadisticas_conjunto(X, t)
% ESTIMAR_ESTADISTICAS_CONJUNTO Estima momentos de 1er y 2do orden WSS.
    [M, N] = size(X);
    
    % Estimadores insesgados de media y varianza a traves de las M trayectorias
    mu_hat = mean(X, 1);
    var_hat = var(X, 0, 1);
    
    % Matriz completa de autocorrelacion de conjunto: R = (1/M) X' * X
    % Cada celda (i, j) estima E[X(t_i) * X(t_j)]
    R_mat = (X' * X) / M;
    
    % Extraccion sobre retardos tau = k * dt promediando diagonales de Toeplitz
    dt = t(2) - t(1);
    lags_idx = -(N - 1):(N - 1);
    lags_tau = lags_idx * dt;
    R_tau = zeros(1, length(lags_idx));
    for k = 1:length(lags_idx)
        diag_offset = lags_idx(k);
        R_tau(k) = mean(diag(R_mat, diag_offset));
    end
end`,

    "estimar_temporal": `function [mu_temp, var_temp, R_temp, lags_temp] = estimar_estadisticas_temporales(x_single, t_single, max_lag_sec)
% ESTIMAR_ESTADISTICAS_TEMPORALES Verifica ergodicidad sobre 1 sola realizacion.
    N = length(x_single);
    dt = t_single(2) - t_single(1);
    
    % Promedios temporales continuos discretizados
    mu_temp = mean(x_single);
    var_temp = var(x_single, 1);
    
    max_lag_samples = round(max_lag_sec / dt);
    % Estimador insesgado de autocorrelacion temporal mediante xcorr:
    % Normalizacion 'unbiased' divide cada retardo k por (N - |k|)
    [R_raw, lags_idx] = xcorr(x_single, max_lag_samples, 'unbiased');
    R_temp = R_raw;
    lags_temp = lags_idx * dt;
end`,

    "simular_contraejemplo": `function [Y, mu_Y, var_Y, t, R_Y_mat, W, var_W] = simular_contraejemplo(M, t, A, f0, alpha_ramp, seed)
% SIMULAR_CONTRAEJEMPLO Falla intencional de estacionariedad (WSS).
    if nargin >= 6 && ~isempty(seed)
        rng(seed + 100);
    end
    N = length(t);
    Theta = 2 * pi * rand(M, 1);
    
    % 1. Modulacion de amplitud temporal no estacionaria:
    % Y(t) = A * (1 + alpha*t) * cos(2*pi*f0*t + Theta)
    envolvente = 1 + alpha_ramp * t;
    fase_total = 2 * pi * f0 * t + Theta;
    Y = (A .* repmat(envolvente, M, 1)) .* cos(fase_total);
    
    mu_Y = mean(Y, 1);
    var_Y = var(Y, 0, 1);
    R_Y_mat = (Y' * Y) / M;
    
    % 2. Caminata aleatoria discreta (Modelo de ruido de fase en osciladores)
    % W[n] = sum_{k=1}^n Z[k], Z ~ N(0, sigma^2) -> Var(W[n]) propto n
    W = cumsum(0.1 * randn(M, N), 2);
    var_W = var(W, 0, 1);
end`,

    "main_script": `% SCRIPT MAESTRO: ORQUESTACION Y EVALUACION EXPERIMENTAL
cfg = config_parametros(); rng(cfg.seed);

% 1. Ensamble WSS (M = 100, 1000, 10000)
[X_10k, th_10k] = generar_proceso_sinusoidal(cfg.M_grande, cfg.t, cfg.A, cfg.f0, cfg.seed+2);
[mu_10k, var_10k, R_mat, R_tau, lags] = estimar_estadisticas_conjunto(X_10k, cfg.t);

% 2. Ergodicidad: 1 sola trayectoria larga (T = 1.0 s, 1000 ciclos)
[x_l, ~] = generar_proceso_sinusoidal(1, cfg.t_long, cfg.A, cfg.f0, cfg.seed+99);
[mu_t, var_t, R_t, lags_t] = estimar_estadisticas_temporales(x_l, cfg.t_long, cfg.T_obs);

% 3. Contraejemplo no estacionario
[Y, mu_Y, var_Y, ~, R_Y, W, var_W] = simular_contraejemplo(cfg.M_grande, cfg.t, cfg.A, cfg.f0, cfg.alpha_ramp, cfg.seed);

% Exporta Figuras 1 a 6 a 300 DPI y genera reporte metricas_simulacion.txt`
  }
};
