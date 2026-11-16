function cfg = config_parametros()
% CONFIG_PARAMETROS Parametros globales de simulacion estocastica
% Curso: Metodos Matematicos 2 (1702228) - Semestre 2026-B
% Escuela Profesional de Ingenieria en Telecomunicaciones - UNSA
% Grupo 02 - Tema 08: Introduccion a Procesos Estocasticos

    % Semilla fija para reproducibilidad exacta de resultados
    cfg.seed = 202608;
    
    % Parametros de la senal sinusoidal con fase aleatoria
    cfg.A = 2.0;               % Amplitud pico de la portadora [V]
    cfg.f0 = 1000;             % Frecuencia fundamental [Hz] (1 kHz)
    cfg.T0 = 1 / cfg.f0;       % Periodo fundamental [s] (1 ms)
    
    % Parametros de discretizacion temporal (Nyquist-Shannon)
    cfg.fs = 20000;            % Frecuencia de muestreo [Hz] (20 kSa/s, 20 muestras/ciclo)
    cfg.dt = 1 / cfg.fs;       % Intervalo de muestreo [s]
    
    % Ventana de observacion de conjunto (5 periodos completos)
    cfg.T_obs = 5 * cfg.T0;    % Tiempo total de observacion [s] (5 ms)
    cfg.t = 0:cfg.dt:cfg.T_obs;% Vector de tiempo para ensamble
    cfg.N_samples = length(cfg.t);
    
    % Tamaños de ensamble para analisis de convergencia Monte Carlo
    cfg.M_pequeno = 100;       % Ensamble reducido
    cfg.M_medio   = 1000;      % Ensamble estandar
    cfg.M_grande  = 10000;     % Ensamble de alta precision
    
    % Parametros para analisis de ergodicidad temporal (1 realizacion larga)
    cfg.T_long = 1.0;          % Ventana temporal de larga duracion [s] (1000 ciclos)
    cfg.t_long = 0:cfg.dt:cfg.T_long;
    cfg.N_long = length(cfg.t_long);
    
    % Parametros del contraejemplo no estacionario
    % Y(t) = (1 + alpha * t) * cos(2*pi*f0*t + Theta)
    cfg.alpha_ramp = 600.0;    % Pendiente de modulacion temporal [s^-1]
    
    % Directorios de salida para figuras y tablas
    cfg.dir_figuras_informe = fullfile('..', '01_Informe_IEEE', 'figures');
    cfg.dir_figuras_presentacion = fullfile('..', '02_Presentacion', 'figures');
    cfg.dir_datos = fullfile('.');
end
