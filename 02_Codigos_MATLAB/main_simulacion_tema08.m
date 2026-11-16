%% SCRIPT PRINCIPAL: MODELADO Y SIMULACION DE PROCESOS ESTOCASTICOS
% Tema 08: Introduccion a procesos estocasticos: clasificacion,
%          estacionariedad y ergodicidad
%
% Curso:      Metodos Matematicos 2 (1702228) - Semestre 2026-B
% Carrera:    Ingenieria en Telecomunicaciones
% Universidad: Universidad Nacional de San Agustin de Arequipa (UNSA)
% Docente:    Mg. Oswaldo Rene Banda Sayco
% Grupo:      Grupo 02
% Integrantes:
%   1. Gutierrez Ccolqque, Franco Arturo
%   2. Gaimez Ollachica, Fernando
%   3. Uturunco Cuela, Zaul Francisco
%   4. Castro Quispe, Fernando Josue
%   5. Quispe Flores, Benjamin Eduardo

clear; close all; clc;

fprintf('====================================================================\n');
fprintf('  TRABAJO DE INVESTIGACION FORMATIVA (TIF) - GRUPO 02\n');
fprintf('  Tema 08: Introduccion a Procesos Estocasticos\n');
fprintf('====================================================================\n\n');

%% 1. Carga de configuracion y parametros fisicos
cfg = config_parametros();
rng(cfg.seed);

% Carpetas de destino para guardar figuras en alta resolucion
dirs_destino = {cfg.dir_figuras_informe, cfg.dir_figuras_presentacion};
for d = 1:length(dirs_destino)
    if ~exist(dirs_destino{d}, 'dir')
        mkdir(dirs_destino{d});
    end
end

fprintf('[1/6] Parametros del sistema configurados:\n');
fprintf('      - Amplitud A: %.2f V\n', cfg.A);
fprintf('      - Frecuencia f0: %.1f Hz (T0 = %.4f s)\n', cfg.f0, cfg.T0);
fprintf('      - Frecuencia de muestreo fs: %.0f Hz (dt = %.2e s)\n', cfg.fs, cfg.dt);
fprintf('      - Ventana de observacion ensamble: %.3f s (%d muestras)\n', cfg.T_obs, cfg.N_samples);
fprintf('      - Potencia teorica media P_X = A^2/2: %.4f W\n\n', cfg.A^2 / 2);

%% 2. Generacion del ensamble para distintos tamaños muestrales
fprintf('[2/6] Generando ensambles de portadora con fase aleatoria Theta ~ U(0, 2*pi)...\n');
[X_100,   theta_100]   = generar_proceso_sinusoidal(cfg.M_pequeno, cfg.t, cfg.A, cfg.f0, cfg.seed);
[X_1000,  theta_1000]  = generar_proceso_sinusoidal(cfg.M_medio,   cfg.t, cfg.A, cfg.f0, cfg.seed + 1);
[X_10000, theta_10000] = generar_proceso_sinusoidal(cfg.M_grande,  cfg.t, cfg.A, cfg.f0, cfg.seed + 2);

%% 3. Estimacion de estadisticas de conjunto (WSS)
fprintf('[3/6] Estimando estadisticas de conjunto...\n');
[mu_100,   var_100,   R_mat_100,   R_tau_100,   lags_tau] = estimar_estadisticas_conjunto(X_100,   cfg.t);
[mu_1000,  var_1000,  R_mat_1000,  R_tau_1000,  ~]        = estimar_estadisticas_conjunto(X_1000,  cfg.t);
[mu_10000, var_10000, R_mat_10000, R_tau_10000, ~]        = estimar_estadisticas_conjunto(X_10000, cfg.t);

% Autocorrelacion teorica: R_X(tau) = (A^2 / 2) * cos(2*pi*f0*tau)
R_teorica = (cfg.A^2 / 2) * cos(2 * pi * cfg.f0 * lags_tau);

% Metricas de error cuantitativo de conjunto
mae_mu_100   = mean(abs(mu_100));
mae_mu_1000  = mean(abs(mu_1000));
mae_mu_10000 = mean(abs(mu_10000));

rmse_R_100   = sqrt(mean((R_tau_100   - R_teorica).^2));
rmse_R_1000  = sqrt(mean((R_tau_1000  - R_teorica).^2));
rmse_R_10000 = sqrt(mean((R_tau_10000 - R_teorica).^2));

potencia_sim_10000 = mean(var_10000);
potencia_teorica   = cfg.A^2 / 2;
err_rel_potencia   = abs(potencia_sim_10000 - potencia_teorica) / potencia_teorica * 100;

fprintf('      - Error absoluto medio de mu(t) [M=10000]:  %.5e V\n', mae_mu_10000);
fprintf('      - RMSE de R_X(tau) [M=10000]:               %.5e W\n', rmse_R_10000);
fprintf('      - Potencia estimada R(0) [M=10000]:         %.5f W (Teorica: %.5f W, Error: %.3f%%)\n\n', ...
        potencia_sim_10000, potencia_teorica, err_rel_potencia);

%% 4. Analisis de Ergodicidad: Promedios Temporales vs Conjunto
fprintf('[4/6] Evaluando ergodicidad mediante una sola trayectoria de larga duracion...\n');
% Generacion de 1 realizacion larga (T_long = 1.0 s, 1000 ciclos de portadora)
[x_long, theta_single] = generar_proceso_sinusoidal(1, cfg.t_long, cfg.A, cfg.f0, cfg.seed + 99);
[mu_temp, var_temp, R_temp, lags_temp] = estimar_estadisticas_temporales(x_long, cfg.t_long, cfg.T_obs);

% Comparacion en el mismo rango de retardos
idx_tau_pos = lags_tau >= 0;
tau_comp = lags_tau(idx_tau_pos);
R_teo_comp = (cfg.A^2 / 2) * cos(2 * pi * cfg.f0 * tau_comp);
R_ens_comp = R_tau_10000(idx_tau_pos);

% Interpolar R_temp al vector tau_comp para calcular RMSE exacto
R_temp_interp = interp1(lags_temp, R_temp, tau_comp);
rmse_ergodica_temporal = sqrt(mean((R_temp_interp - R_teo_comp).^2));

fprintf('      - Media temporal <x(t)>:                   %.5e V (Teorica: 0.0 V)\n', mu_temp);
fprintf('      - Potencia temporal <x^2(t)>:              %.5f W (Teorica: %.5f W)\n', var_temp, potencia_teorica);
fprintf('      - RMSE Autocorrelacion temporal vs teoria: %.5e W\n\n', rmse_ergodica_temporal);

%% 5. Contraejemplo No Estacionario
fprintf('[5/6] Simulando proceso no estacionario (amplitud creciente y caminata aleatoria)...\n');
[Y, mu_Y, var_Y, ~, R_Y_mat, W, var_W] = simular_contraejemplo(cfg.M_grande, cfg.t, cfg.A, cfg.f0, cfg.alpha_ramp, cfg.seed);

% Varianza teorica del contraejemplo: Var(Y(t)) = (A^2 / 2) * (1 + alpha * t)^2
var_Y_teorica = (cfg.A^2 / 2) * (1 + cfg.alpha_ramp * cfg.t).^2;
rmse_var_contraejemplo = sqrt(mean((var_Y - var_Y_teorica).^2));
fprintf('      - RMSE Varianza no estacionaria sim vs teoria: %.4f W\n\n', rmse_var_contraejemplo);

%% 6. Generacion de Figuras de Calidad Cientifica (IEEE)
fprintf('[6/6] Renderizando y guardando figuras a 300 DPI...\n');

set(0, 'DefaultAxesFontName', 'Arial');
set(0, 'DefaultAxesFontSize', 10);
set(0, 'DefaultTextFontName', 'Arial');
set(0, 'DefaultTextFontSize', 10);

% -------------------------------------------------------------------------
% FIGURA 1: Muestras del Ensamble del Proceso Estocastico Sinusoidal
% -------------------------------------------------------------------------
f1 = figure('Name', 'Fig1_Realizaciones_Ensamble', 'Color', 'w', 'Position', [100, 100, 750, 480]);
colores = [0.00, 0.45, 0.74;  % Azul
           0.85, 0.33, 0.10;  % Naranja
           0.47, 0.67, 0.19;  % Verde
           0.49, 0.18, 0.56;  % Purpura
           0.93, 0.69, 0.13]; % Amarillo
hold on; grid on; box on;
t_ms = cfg.t * 1e3;
num_trazas = 5;
for m = 1:num_trazas
    plot(t_ms, X_10000(m, :), 'LineWidth', 1.4, 'Color', colores(m, :), ...
        'DisplayName', sprintf('Realizacion x_{%d}(t), \\Theta_{%d} = %.2f\\pi rad', ...
        m, m, theta_10000(m) / pi));
end
% Indicador del corte transversal (instante t_0 fijo)
t_corte_ms = 1.25;
idx_corte = round(t_corte_ms * 1e-3 / cfg.dt) + 1;
xline(t_corte_ms, '--k', 'LineWidth', 1.5, 'DisplayName', sprintf('Corte t = %.2f ms (v.a. X(t))', t_corte_ms));
scatter(repmat(t_corte_ms, num_trazas, 1), X_10000(1:num_trazas, idx_corte), 45, 'ko', 'filled', 'HandleVisibility', 'off');

xlabel('Tiempo t [ms]', 'FontWeight', 'bold');
ylabel('Amplitud [V]', 'FontWeight', 'bold');
title(sprintf('Ensamble de Realizaciones de X(t) = A cos(2\\pi f_0 t + \\Theta), \\Theta \\sim U(0, 2\\pi) [A = %.1f V, f_0 = %d Hz]', ...
      cfg.A, cfg.f0), 'FontSize', 11, 'FontWeight', 'bold');
legend('Location', 'northeast', 'FontSize', 8.5);
xlim([0, cfg.T_obs * 1e3]);
ylim([-cfg.A * 1.25, cfg.A * 1.25]);

% -------------------------------------------------------------------------
% FIGURA 2: Media y Varianza de Conjunto vs Tiempo
% -------------------------------------------------------------------------
f2 = figure('Name', 'Fig2_Media_Varianza_Conjunto', 'Color', 'w', 'Position', [120, 120, 800, 520]);

subplot(2, 1, 1);
hold on; grid on; box on;
plot(t_ms, mu_100,   'LineWidth', 1.0, 'Color', [0.85, 0.33, 0.10], 'DisplayName', 'Estimacion M = 100');
plot(t_ms, mu_1000,  'LineWidth', 1.1, 'Color', [0.47, 0.67, 0.19], 'DisplayName', 'Estimacion M = 1,000');
plot(t_ms, mu_10000, 'LineWidth', 1.5, 'Color', [0.00, 0.45, 0.74], 'DisplayName', 'Estimacion M = 10,000');
yline(0, 'k--', 'LineWidth', 1.5, 'DisplayName', 'Valor Teorico \mu_X = 0 V');
xlabel('Tiempo t [ms]', 'FontWeight', 'bold');
ylabel('Media \mu_X(t) [V]', 'FontWeight', 'bold');
title('Evaluacion de Estacionariedad de Primer Orden: Media de Conjunto \mu_X(t)', 'FontSize', 10.5, 'FontWeight', 'bold');
legend('Location', 'southeast', 'FontSize', 8);
xlim([0, cfg.T_obs * 1e3]);
ylim([-0.35, 0.35]);

subplot(2, 1, 2);
hold on; grid on; box on;
plot(t_ms, var_100,   'LineWidth', 1.0, 'Color', [0.85, 0.33, 0.10], 'DisplayName', 'Estimacion M = 100');
plot(t_ms, var_1000,  'LineWidth', 1.1, 'Color', [0.47, 0.67, 0.19], 'DisplayName', 'Estimacion M = 1,000');
plot(t_ms, var_10000, 'LineWidth', 1.5, 'Color', [0.00, 0.45, 0.74], 'DisplayName', 'Estimacion M = 10,000');
yline(cfg.A^2 / 2, 'k--', 'LineWidth', 1.5, 'DisplayName', sprintf('Valor Teorico A^2/2 = %.2f V^2', cfg.A^2 / 2));
xlabel('Tiempo t [ms]', 'FontWeight', 'bold');
ylabel('Varianza \sigma_X^2(t) [V^2]', 'FontWeight', 'bold');
title('Evaluacion de Varianza de Conjunto: \sigma_X^2(t) = R_X(0)', 'FontSize', 10.5, 'FontWeight', 'bold');
legend('Location', 'southeast', 'FontSize', 8);
xlim([0, cfg.T_obs * 1e3]);
ylim([1.4, 2.6]);

% -------------------------------------------------------------------------
% FIGURA 3: Matriz de Autocorrelacion 2D y Corte Unidimensional WSS
% -------------------------------------------------------------------------
f3 = figure('Name', 'Fig3_Autocorrelacion_2D_1D', 'Color', 'w', 'Position', [140, 140, 850, 480]);

subplot(1, 2, 1);
[T1_grid, T2_grid] = meshgrid(t_ms, t_ms);
imagesc(t_ms, t_ms, R_mat_10000);
axis xy; axis square;
colormap(jet);
colorbar;
xlabel('Instante t_1 [ms]', 'FontWeight', 'bold');
ylabel('Instante t_2 [ms]', 'FontWeight', 'bold');
title('Matriz R_X(t_1, t_2) [M = 10,000]', 'FontSize', 10.5, 'FontWeight', 'bold');

subplot(1, 2, 2);
hold on; grid on; box on;
lags_ms = lags_tau * 1e3;
plot(lags_ms, R_teorica, 'k-', 'LineWidth', 2.0, 'DisplayName', 'Teoria: (A^2/2) cos(2\pi f_0 \tau)');
plot(lags_ms, R_tau_100,   ':',  'LineWidth', 1.2, 'Color', [0.85, 0.33, 0.10], 'DisplayName', 'Sim. M = 100');
plot(lags_ms, R_tau_1000,  '--', 'LineWidth', 1.3, 'Color', [0.47, 0.67, 0.19], 'DisplayName', 'Sim. M = 1,000');
plot(lags_ms, R_tau_10000, '-',  'LineWidth', 1.4, 'Color', [0.00, 0.45, 0.74], 'DisplayName', 'Sim. M = 10,000');
xlabel('Retardo temporal \tau [ms]', 'FontWeight', 'bold');
ylabel('Autocorrelacion R_X(\tau) [W]', 'FontWeight', 'bold');
title('Corte Unidimensional R_X(\tau) vs Retardo', 'FontSize', 10.5, 'FontWeight', 'bold');
legend('Location', 'northeast', 'FontSize', 8);
xlim([-cfg.T_obs * 1e3, cfg.T_obs * 1e3]);
ylim([-2.3, 2.3]);

% -------------------------------------------------------------------------
% FIGURA 4: Comprobacion de Ergodicidad (Conjunto vs Temporal)
% -------------------------------------------------------------------------
f4 = figure('Name', 'Fig4_Ergodicidad_Conjunto_Temporal', 'Color', 'w', 'Position', [160, 160, 800, 500]);
hold on; grid on; box on;
plot(tau_comp * 1e3, R_teo_comp, 'k-', 'LineWidth', 2.2, 'DisplayName', 'R_X(\tau) Teorica');
plot(tau_comp * 1e3, R_ens_comp, 'b--', 'LineWidth', 1.8, 'DisplayName', 'Promedio de Conjunto \hat{R}_{ens}(\tau) [M=10,000]');
plot(lags_temp(lags_temp >= 0) * 1e3, R_temp(lags_temp >= 0), 'r-.', 'LineWidth', 1.5, ...
     'DisplayName', 'Promedio Temporal \mathcal{R}_x(\tau) [1 sola trayectoria, T = 1.0 s]');
xlabel('Retardo temporal \tau [ms]', 'FontWeight', 'bold');
ylabel('Autocorrelacion [W]', 'FontWeight', 'bold');
title('Verificacion de Ergodicidad en la Autocorrelacion: \hat{R}_{ens}(\tau) \equiv \mathcal{R}_x(\tau) \equiv R_X(\tau)', ...
      'FontSize', 11, 'FontWeight', 'bold');
legend('Location', 'northeast', 'FontSize', 9);
xlim([0, cfg.T_obs * 1e3]);
ylim([-2.2, 2.2]);

% -------------------------------------------------------------------------
% FIGURA 5: Contraejemplo No Estacionario (Falla de WSS)
% -------------------------------------------------------------------------
f5 = figure('Name', 'Fig5_Contraejemplo_No_Estacionario', 'Color', 'w', 'Position', [180, 180, 850, 520]);

subplot(2, 2, 1);
hold on; grid on; box on;
plot(t_ms, Y(1:3, :), 'LineWidth', 1.2);
xlabel('Tiempo t [ms]', 'FontWeight', 'bold');
ylabel('Y(t) [V]', 'FontWeight', 'bold');
title('Realizaciones de Y(t) = A(1+\alpha t) cos(2\pi f_0 t + \Theta)', 'FontSize', 9.5, 'FontWeight', 'bold');
xlim([0, cfg.T_obs * 1e3]);

subplot(2, 2, 2);
hold on; grid on; box on;
plot(t_ms, var_Y_teorica, 'k-', 'LineWidth', 1.8, 'DisplayName', 'Teorica: \sigma_Y^2(t) = \frac{A^2}{2}(1+\alpha t)^2');
plot(t_ms, var_Y, 'r--', 'LineWidth', 1.5, 'DisplayName', 'Simulada (M = 10,000)');
xlabel('Tiempo t [ms]', 'FontWeight', 'bold');
ylabel('Varianza \sigma_Y^2(t) [V^2]', 'FontWeight', 'bold');
title('Crecimiento Temporal de Varianza (Falla WSS)', 'FontSize', 9.5, 'FontWeight', 'bold');
legend('Location', 'northwest', 'FontSize', 7.5);
xlim([0, cfg.T_obs * 1e3]);

subplot(2, 2, 3);
imagesc(t_ms, t_ms, R_Y_mat);
axis xy; axis square;
colormap(jet);
colorbar;
xlabel('t_1 [ms]', 'FontWeight', 'bold');
ylabel('t_2 [ms]', 'FontWeight', 'bold');
title('Matriz R_Y(t_1, t_2) No Estacionaria', 'FontSize', 9.5, 'FontWeight', 'bold');

subplot(2, 2, 4);
hold on; grid on; box on;
plot(t_ms, W(1:4, :), 'LineWidth', 1.1);
plot(t_ms, sqrt(var_W), 'k-', 'LineWidth', 2.0, 'DisplayName', '\pm \sigma_W(n) \propto \sqrt{n}');
plot(t_ms, -sqrt(var_W), 'k-', 'LineWidth', 2.0, 'HandleVisibility', 'off');
xlabel('Tiempo t [ms]', 'FontWeight', 'bold');
ylabel('W[n]', 'FontWeight', 'bold');
title('Caminata Aleatoria (Dispersion Variable)', 'FontSize', 9.5, 'FontWeight', 'bold');
legend('Location', 'northwest', 'FontSize', 7.5);
xlim([0, cfg.T_obs * 1e3]);

% -------------------------------------------------------------------------
% FIGURA 6: Convergencia Monte Carlo y Teorema del Limite Central
% -------------------------------------------------------------------------
f6 = figure('Name', 'Fig6_Convergencia_Monte_Carlo', 'Color', 'w', 'Position', [200, 200, 750, 420]);
M_vector = [50, 100, 200, 500, 1000, 2000, 5000, 10000];
rmse_convergencia = zeros(size(M_vector));
mae_mu_convergencia = zeros(size(M_vector));

for idx_m = 1:length(M_vector)
    M_val = M_vector(idx_m);
    [X_sub, ~] = generar_proceso_sinusoidal(M_val, cfg.t, cfg.A, cfg.f0, cfg.seed + idx_m * 7);
    [mu_sub, ~, ~, R_tau_sub, ~] = estimar_estadisticas_conjunto(X_sub, cfg.t);
    mae_mu_convergencia(idx_m) = mean(abs(mu_sub));
    rmse_convergencia(idx_m) = sqrt(mean((R_tau_sub - R_teorica).^2));
end

hold on; grid on; box on;
loglog(M_vector, mae_mu_convergencia, 's-', 'LineWidth', 1.6, 'Color', [0.85, 0.33, 0.10], ...
       'DisplayName', 'Error Absoluto Medio \mu_X(t)');
loglog(M_vector, rmse_convergencia, 'o-', 'LineWidth', 1.6, 'Color', [0.00, 0.45, 0.74], ...
       'DisplayName', 'RMSE Autocorrelacion R_X(\tau)');

% Pendiente teorica O(1 / sqrt(M))
pendiente_asintotica = rmse_convergencia(1) * sqrt(M_vector(1)) ./ sqrt(M_vector);
loglog(M_vector, pendiente_asintotica, 'k--', 'LineWidth', 1.4, ...
       'DisplayName', 'Tasa Asintotica Teorema Limite Central O(1/\surd M)');

xlabel('Numero de Realizaciones M (Escala Logaritmica)', 'FontWeight', 'bold');
ylabel('Error Cuantitativo (Escala Logaritmica)', 'FontWeight', 'bold');
title('Convergencia del Estimador de Monte Carlo segun la Ley de los Grandes Numeros', ...
      'FontSize', 11, 'FontWeight', 'bold');
legend('Location', 'northeast', 'FontSize', 8.5);

%% 7. Exportacion de figuras en alta resolucion y guardado de metricas
figuras = {f1, f2, f3, f4, f5, f6};
nombres = {'fig1_realizaciones_ensamble', ...
           'fig2_media_y_varianza_conjunto', ...
           'fig3_autocorrelacion_conjunto_2d_1d', ...
           'fig4_ergodicidad_conjunto_vs_temporal', ...
           'fig5_contraejemplo_no_estacionario', ...
           'fig6_convergencia_monte_carlo'};

for f = 1:length(figuras)
    fig_actual = figuras{f};
    nombre_actual = nombres{f};
    
    for d = 1:length(dirs_destino)
        ruta_png = fullfile(dirs_destino{d}, [nombre_actual, '.png']);
        exportgraphics(fig_actual, ruta_png, 'Resolution', 300);
    end
end

% Guardado de archivo de texto con metricas exactas para el informe y diapositivas
archivo_metricas = 'metricas_simulacion.txt';
fid = fopen(archivo_metricas, 'w');
fprintf(fid, 'METRICAS NUMERICAS DE SIMULACION - TEMA 08 (GRUPO 02)\n');
fprintf(fid, '====================================================\n\n');
fprintf(fid, 'PARAMETROS NOMINALES:\n');
fprintf(fid, '  Amplitud A: %.4f V\n', cfg.A);
fprintf(fid, '  Frecuencia f0: %.4f Hz\n', cfg.f0);
fprintf(fid, '  Frecuencia muestreo fs: %.4f Hz\n', cfg.fs);
fprintf(fid, '  Ventana ensamble T_obs: %.6f s\n', cfg.T_obs);
fprintf(fid, '  Potencia teorica P_X = A^2/2: %.6f W\n\n', potencia_teorica);

fprintf(fid, 'ESTADISTICAS DE CONJUNTO SEGUN TAMAÑO DE ENSAMBLE:\n');
fprintf(fid, '  M = 100:\n');
fprintf(fid, '    MAE media mu_X(t): %.6f V\n', mae_mu_100);
fprintf(fid, '    RMSE autocorrelacion R_X(tau): %.6f W\n', rmse_R_100);
fprintf(fid, '    Potencia media estimada R(0): %.6f W\n', mean(var_100));
fprintf(fid, '  M = 1000:\n');
fprintf(fid, '    MAE media mu_X(t): %.6f V\n', mae_mu_1000);
fprintf(fid, '    RMSE autocorrelacion R_X(tau): %.6f W\n', rmse_R_1000);
fprintf(fid, '    Potencia media estimada R(0): %.6f W\n', mean(var_1000));
fprintf(fid, '  M = 10000:\n');
fprintf(fid, '    MAE media mu_X(t): %.6f V\n', mae_mu_10000);
fprintf(fid, '    RMSE autocorrelacion R_X(tau): %.6f W\n', rmse_R_10000);
fprintf(fid, '    Potencia media estimada R(0): %.6f W\n', potencia_sim_10000);
fprintf(fid, '    Error relativo porcentual de potencia: %.4f %%\n\n', err_rel_potencia);

fprintf(fid, 'ESTADISTICAS TEMPORALES (1 REALIZACION LARGA, T = 1.0 s):\n');
fprintf(fid, '  Media temporal <x(t)>: %.6f V\n', mu_temp);
fprintf(fid, '  Potencia temporal <x^2(t)>: %.6f W\n', var_temp);
fprintf(fid, '  RMSE autocorrelacion temporal vs teoria: %.6f W\n\n', rmse_ergodica_temporal);

fprintf(fid, 'CONTRAEJEMPLO NO ESTACIONARIO (Y(t) = A(1+alpha*t)cos(2*pi*f0*t + Theta)):\n');
fprintf(fid, '  Pendiente alpha: %.4f s^-1\n', cfg.alpha_ramp);
fprintf(fid, '  RMSE varianza sim vs teorica: %.6f W\n', rmse_var_contraejemplo);
fprintf(fid, '  Varianza inicial (t=0): %.6f W\n', var_Y(1));
fprintf(fid, '  Varianza final (t=5ms): %.6f W\n', var_Y(end));
fclose(fid);

% Guardar tambien workspace .mat
save('workspace_simulacion_tema08.mat');

fprintf('\n>>> Simulacion completada exitosamente.\n');
fprintf('>>> Figuras exportadas a 300 DPI en:\n    - 01_Informe_IEEE/figures/\n    - 03_Presentacion_Web/figures/\n');
fprintf('>>> Metricas guardadas en metricas_simulacion.txt\n');
