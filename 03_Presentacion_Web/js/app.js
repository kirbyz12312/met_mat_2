/**
 * TIF GRUPO 02 - TEMA 08: MOTOR DE PRESENTACION Y GRAFICACION INTERACTIVA
 * Estilo Verde Tecnológico / Emerald High-Tech (UNSA Telecomunicaciones)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado global
  const state = {
    currentSlide: 1,
    totalSlides: 16,
    isFullscreen: false,
    charts: {}, // Almacén de instancias de Chart.js
    plotlyRendered: {}
  };

  // Referencias DOM
  const dom = {
    slides: document.querySelectorAll('.slide-pane'),
    currentSlideNum: document.getElementById('current-slide-num'),
    totalSlidesNum: document.getElementById('total-slides-num'),
    progressBar: document.getElementById('progress-bar-fill'),
    btnPrev: document.getElementById('btn-prev'),
    btnNext: document.getElementById('btn-next'),
    btnFullscreen: document.getElementById('btn-fullscreen'),
    btnOverview: document.getElementById('btn-overview'),
    btnPrintPdf: document.getElementById('btn-print-pdf'),
    
    // Modal Sidebar / Índice
    sidebarModal: document.getElementById('sidebar-modal'),
    btnCloseSidebar: document.getElementById('btn-close-sidebar'),
    sidebarGrid: document.getElementById('sidebar-grid'),

    // Modal Lightbox para figuras MATLAB 300 DPI
    lightboxModal: document.getElementById('image-lightbox-modal'),
    lightboxImg: document.getElementById('lightbox-image'),
    lightboxTitle: document.getElementById('lightbox-title'),
    lightboxClose: document.getElementById('lightbox-close'),
    lightboxDownload: document.getElementById('lightbox-download-link')
  };

  // =========================================================================
  // 1. ANIMACION CANVAS DE FONDO (Ondas Fasoriales y Barras en Verde Emerald)
  // =========================================================================
  function initBackgroundCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let step = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      step += 0.015;

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height * 0.48;

      // 1. Barras espectrales armónicas en verde tecnológico
      const numBars = 36;
      const barWidth = width / (numBars * 1.5);
      const gap = barWidth * 0.5;
      const startX = (width - (numBars * (barWidth + gap))) / 2;

      for (let i = 0; i < numBars; i++) {
        const barHeight =
          Math.sin(step * 1.2 + i * 0.28) * 35 +
          Math.cos(step * 0.8 + i * 0.15) * 25 +
          45;

        const bx = startX + i * (barWidth + gap);
        const by = height - barHeight - 20;

        const gradient = ctx.createLinearGradient(0, by, 0, height);
        gradient.addColorStop(0, 'rgba(0, 245, 160, 0.22)');
        gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.12)');
        gradient.addColorStop(1, 'rgba(5, 150, 105, 0.01)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(bx, by, barWidth, barHeight, [4, 4, 0, 0]);
        } else {
          ctx.rect(bx, by, barWidth, barHeight);
        }
        ctx.fill();
      }

      // 2. Ondas sinusoidales fasoriales en verde neón y esmeralda
      const waves = [
        { freq: 0.008, amp: 45, speed: 0.02, color: 'rgba(0, 245, 160, 0.38)', width: 2 },
        { freq: 0.014, amp: 30, speed: -0.015, color: 'rgba(16, 185, 129, 0.32)', width: 2 },
        { freq: 0.022, amp: 18, speed: 0.028, color: 'rgba(45, 212, 191, 0.25)', width: 1.5 },
      ];

      waves.forEach((w) => {
        ctx.beginPath();
        ctx.lineWidth = w.width;
        ctx.strokeStyle = w.color;

        for (let x = 0; x < width; x += 4) {
          const y = centerY + Math.sin(x * w.freq + step * (w.speed * 100)) * w.amp;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
  }

  // =========================================================================
  // 2. OPCIONES OSCURAS PARA CHART.JS (TEMA VERDE TELECOM)
  // =========================================================================
  function getDarkChartOptions(title, xTitle, yTitle, minTicks = 8) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 550,
        easing: 'easeOutQuart'
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            color: '#cbd5e1',
            font: { family: "'Inter', sans-serif", size: 10, weight: '500' },
            boxWidth: 9,
            boxHeight: 9,
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 7
          }
        },
        title: {
          display: true,
          text: title,
          color: '#f8fafc',
          font: { family: "'Inter', sans-serif", size: 11, weight: '600' },
          padding: { bottom: 5 },
          align: 'start'
        },
        tooltip: {
          backgroundColor: 'rgba(8, 12, 22, 0.95)',
          titleColor: '#00f5a0',
          bodyColor: '#f1f5f9',
          borderColor: '#10b981',
          borderWidth: 1,
          padding: 8,
          cornerRadius: 8,
          titleFont: { family: "'Fira Code', monospace", size: 10.5 },
          bodyFont: { family: "'Fira Code', monospace", size: 10 },
          displayColors: true
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: xTitle,
            color: '#94a3b8',
            font: { family: "'Inter', sans-serif", size: 9.5, weight: '500' }
          },
          grid: { color: 'rgba(148, 163, 184, 0.08)', tickColor: 'transparent' },
          ticks: { color: '#64748b', maxTicksLimit: minTicks, font: { family: "'Fira Code', monospace", size: 8.5 } }
        },
        y: {
          title: {
            display: true,
            text: yTitle,
            color: '#94a3b8',
            font: { family: "'Inter', sans-serif", size: 9.5, weight: '500' }
          },
          grid: { color: 'rgba(148, 163, 184, 0.08)', tickColor: 'transparent' },
          ticks: { color: '#64748b', maxTicksLimit: 6, font: { family: "'Fira Code', monospace", size: 8.5 } }
        }
      }
    };
  }

  // =========================================================================
  // 3. INICIALIZACION Y RENDERIZADO DE GRAFICOS EN VIVO
  // =========================================================================
  function initChartExp1() {
    const ctx = document.getElementById('chart-exp1');
    if (!ctx || state.charts['exp1']) return;

    const sim = StochasticSim.getEnsembleRealizations(5);
    const colors = ['#00f5a0', '#34d399', '#38bdf8', '#c084fc', '#fbbf24'];

    const datasets = sim.traces.map((tr, idx) => ({
      label: tr.label,
      data: tr.data,
      borderColor: colors[idx % colors.length],
      borderWidth: 1.6,
      pointRadius: 0,
      tension: 0.2
    }));

    // Corte transversal en t = 1.25 ms (puntos discretos de la v.a. X(t_0))
    const cutData = sim.t_ms.map((tVal, idx) => {
      if (idx === sim.cutIdx) {
        return sim.cutValues[0];
      }
      return null;
    });

    state.charts['exp1'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: sim.t_ms,
        datasets: datasets
      },
      options: getDarkChartOptions(
        'Ensamble de Realizaciones X(t) = A cos(2π f0 t + Θ) [Corte t = 1.25 ms]',
        'Tiempo t [ms]',
        'Amplitud [V]',
        10
      )
    });
  }

  function initChartExp2Mean() {
    const ctx = document.getElementById('chart-exp2-mean');
    if (!ctx || state.charts['exp2_mean']) return;

    const data100 = StochasticSim.getMeanAndVariance(100);
    const data1000 = StochasticSim.getMeanAndVariance(1000);
    const data10000 = StochasticSim.getMeanAndVariance(10000);

    state.charts['exp2_mean'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data10000.t_ms,
        datasets: [
          {
            label: 'Estimación M = 100',
            data: data100.mean,
            borderColor: '#fbbf24',
            borderWidth: 1.2,
            pointRadius: 0
          },
          {
            label: 'Estimación M = 1,000',
            data: data1000.mean,
            borderColor: '#34d399',
            borderWidth: 1.3,
            pointRadius: 0
          },
          {
            label: 'Estimación M = 10,000',
            data: data10000.mean,
            borderColor: '#00f5a0',
            borderWidth: 1.8,
            pointRadius: 0
          },
          {
            label: 'Valor Teórico μ_X = 0 V',
            data: Array(data10000.t_ms.length).fill(0),
            borderColor: '#ffffff',
            borderWidth: 1.5,
            borderDash: [5, 5],
            pointRadius: 0
          }
        ]
      },
      options: getDarkChartOptions(
        'Subplot 1: Media de Conjunto μ̂_X(t) vs Tiempo [Invarianza de 1er Orden]',
        'Tiempo t [ms]',
        'Media μ_X [V]'
      )
    });
  }

  function initChartExp2Var() {
    const ctx = document.getElementById('chart-exp2-var');
    if (!ctx || state.charts['exp2_var']) return;

    const data100 = StochasticSim.getMeanAndVariance(100);
    const data1000 = StochasticSim.getMeanAndVariance(1000);
    const data10000 = StochasticSim.getMeanAndVariance(10000);

    state.charts['exp2_var'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data10000.t_ms,
        datasets: [
          {
            label: 'Estimación M = 100',
            data: data100.variance,
            borderColor: '#fbbf24',
            borderWidth: 1.2,
            pointRadius: 0
          },
          {
            label: 'Estimación M = 1,000',
            data: data1000.variance,
            borderColor: '#34d399',
            borderWidth: 1.3,
            pointRadius: 0
          },
          {
            label: 'Estimación M = 10,000',
            data: data10000.variance,
            borderColor: '#00f5a0',
            borderWidth: 1.8,
            pointRadius: 0
          },
          {
            label: 'Valor Teórico A²/2 = 2.0 W',
            data: Array(data10000.t_ms.length).fill(2.0),
            borderColor: '#ffffff',
            borderWidth: 1.5,
            borderDash: [5, 5],
            pointRadius: 0
          }
        ]
      },
      options: getDarkChartOptions(
        'Subplot 2: Varianza de Conjunto σ̂_X²(t) vs Tiempo [Invarianza de 2do Orden]',
        'Tiempo t [ms]',
        'Varianza σ_X² [W]'
      )
    });
  }

  function initChartExp2() {
    initChartExp2Mean();
  }

  function initChartExp3() {
    // 1. Corte 1D en Chart.js (Compara Teoria, M=100, M=1000, M=10000 como en MATLAB)
    const ctx = document.getElementById('chart-exp3-1d');
    if (ctx && !state.charts['exp3_1d']) {
      const data = StochasticSim.getAutocorrelationData(1000);
      state.charts['exp3_1d'] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.lags_tau_ms,
          datasets: [
            {
              label: 'Teoría: (A²/2) cos(2π f₀ τ)',
              data: data.R_theory,
              borderColor: '#ffffff',
              borderWidth: 2.2,
              pointRadius: 0
            },
            {
              label: 'Simulación M = 100',
              data: data.R_sim_100,
              borderColor: '#fbbf24',
              borderWidth: 1.2,
              borderDash: [2, 2],
              pointRadius: 0
            },
            {
              label: 'Simulación M = 1,000',
              data: data.R_sim_1000,
              borderColor: '#34d399',
              borderWidth: 1.3,
              borderDash: [4, 4],
              pointRadius: 0
            },
            {
              label: 'Simulación M = 10,000 (Toeplitz)',
              data: data.R_sim,
              borderColor: '#00f5a0',
              borderWidth: 1.8,
              pointRadius: 0
            }
          ]
        },
        options: getDarkChartOptions(
          'Corte Unidimensional R_X(τ) vs Retardo Temporal [Subplot 2 MATLAB]',
          'Retardo temporal τ [ms]',
          'Autocorrelación [W]'
        )
      });
    }

    // 2. Matriz 2D Heatmap en Plotly con paleta Jet (idéntica a MATLAB)
    const plotlyContainer = document.getElementById('plotly-exp3-2d');
    if (plotlyContainer && typeof Plotly !== 'undefined' && !state.plotlyRendered['exp3_2d']) {
      const data = StochasticSim.getAutocorrelationData(500);
      const plotData = [{
        z: data.R_mat,
        x: data.t_ms,
        y: data.t_ms,
        type: 'heatmap',
        colorscale: 'Jet',
        colorbar: {
          title: 'R(t1, t2)',
          titleside: 'right',
          tickfont: { color: '#94a3b8', size: 8 },
          titlefont: { color: '#00f5a0', size: 9 }
        }
      }];

      const layout = {
        title: {
          text: 'Matriz Bidimensional R_X(t₁, t₂) [Toeplitz - Subplot 1 MATLAB]',
          font: { color: '#f8fafc', size: 11 }
        },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        margin: { t: 30, r: 8, b: 30, l: 30 },
        xaxis: {
          title: 't₁ [ms]',
          color: '#94a3b8',
          tickfont: { color: '#64748b', size: 8.5 },
          gridcolor: 'rgba(148, 163, 184, 0.08)'
        },
        yaxis: {
          title: 't₂ [ms]',
          color: '#94a3b8',
          tickfont: { color: '#64748b', size: 8.5 },
          gridcolor: 'rgba(148, 163, 184, 0.08)'
        }
      };

      Plotly.newPlot(plotlyContainer, plotData, layout, { responsive: true, displayModeBar: false });
      state.plotlyRendered['exp3_2d'] = true;
    }
  }

  function initChartExp4() {
    const ctx = document.getElementById('chart-exp4');
    if (!ctx || state.charts['exp4']) return;

    const data = StochasticSim.getErgodicityData();
    state.charts['exp4'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.tau_ms,
        datasets: [
          {
            label: 'Teoría Analítica R_X(τ)',
            data: data.R_theory,
            borderColor: '#ffffff',
            borderWidth: 2.2,
            pointRadius: 0
          },
          {
            label: 'Promedio Conjunto R̂_ens(τ) [M=10,000]',
            data: data.R_ensemble,
            borderColor: '#38bdf8',
            borderWidth: 1.8,
            borderDash: [4, 4],
            pointRadius: 0
          },
          {
            label: 'Promedio Temporal R_x(τ) [1 onda, T=1 s]',
            data: data.R_temporal,
            borderColor: '#00f5a0',
            borderWidth: 1.6,
            pointRadius: 0
          }
        ]
      },
      options: getDarkChartOptions(
        'Verificación de Ergodicidad: R̂_ens(τ) ≡ R_x(τ) ≡ R_X(τ)',
        'Retardo temporal τ [ms]',
        'Autocorrelación [W]'
      )
    });
  }

  // -------------------------------------------------------------------------
  // EXPERIMENTO 5: CONTRAEJEMPLO NO ESTACIONARIO (4 SUBPLOTS INTERACTIVOS)
  // -------------------------------------------------------------------------
  function initChartExp5Var() {
    const ctx = document.getElementById('chart-exp5-var');
    if (!ctx || state.charts['exp5_var']) return;

    const data = StochasticSim.getCounterexampleData();
    state.charts['exp5_var'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.t_ms,
        datasets: [
          {
            label: 'Varianza Teórica σ_Y²(t) = (A²/2)(1+αt)²',
            data: data.var_theory,
            borderColor: '#ffffff',
            borderWidth: 2,
            pointRadius: 0
          },
          {
            label: 'Varianza Simulada Y(t) [M=10,000]',
            data: data.var_sim,
            borderColor: '#fb7185',
            borderWidth: 1.8,
            borderDash: [3, 3],
            pointRadius: 0
          }
        ]
      },
      options: getDarkChartOptions(
        'Subplot 2: Crecimiento Temporal Cuadrático de la Varianza (Falla WSS)',
        'Tiempo t [ms]',
        'Varianza σ_Y²(t) [W]'
      )
    });
  }

  function initChartExp5Traces() {
    const ctx = document.getElementById('chart-exp5-traces');
    if (!ctx || state.charts['exp5_traces']) return;

    const data = StochasticSim.getCounterexampleData();
    const colors = ['#38bdf8', '#fb923c', '#4ade80'];
    const datasets = data.traces_Y.map((tr, idx) => ({
      label: tr.label,
      data: tr.data,
      borderColor: colors[idx % colors.length],
      borderWidth: 1.4,
      pointRadius: 0
    }));

    state.charts['exp5_traces'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.t_ms,
        datasets: datasets
      },
      options: getDarkChartOptions(
        'Subplot 1: Realizaciones de Y(t) = A(1+αt) cos(2π f₀ t + Θ) con Envolvente Creciente',
        'Tiempo t [ms]',
        'Amplitud Y(t) [V]'
      )
    });
  }

  function initChartExp5Matrix() {
    const container = document.getElementById('plotly-exp5-matrix');
    if (!container || typeof Plotly === 'undefined' || state.plotlyRendered['exp5_matrix']) return;

    const data = StochasticSim.getCounterexampleData();
    const plotData = [{
      z: data.matrix_RY,
      x: data.t_sub_ms,
      y: data.t_sub_ms,
      type: 'heatmap',
      colorscale: 'Jet',
      colorbar: {
        title: 'RY(t1, t2)',
        titleside: 'right',
        tickfont: { color: '#94a3b8', size: 8 },
        titlefont: { color: '#00f5a0', size: 9 }
      }
    }];

    const layout = {
      title: {
        text: 'Subplot 3: Matriz Bidimensional RY(t₁, t₂) No Estacionaria (Falla Toeplitz)',
        font: { color: '#f8fafc', size: 11 }
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { t: 30, r: 8, b: 30, l: 30 },
      xaxis: {
        title: 'Instante t₁ [ms]',
        color: '#94a3b8',
        tickfont: { color: '#64748b', size: 8.5 },
        gridcolor: 'rgba(148, 163, 184, 0.08)'
      },
      yaxis: {
        title: 'Instante t₂ [ms]',
        color: '#94a3b8',
        tickfont: { color: '#64748b', size: 8.5 },
        gridcolor: 'rgba(148, 163, 184, 0.08)'
      }
    };

    Plotly.newPlot(container, plotData, layout, { responsive: true, displayModeBar: false });
    state.plotlyRendered['exp5_matrix'] = true;
  }

  function initChartExp5RW() {
    const ctx = document.getElementById('chart-exp5-rw');
    if (!ctx || state.charts['exp5_rw']) return;

    const data = StochasticSim.getCounterexampleData();
    const colors = ['#38bdf8', '#fb923c', '#eab308', '#a855f7'];
    const datasets = data.rwTraces.map((tr, idx) => ({
      label: tr.label,
      data: tr.data,
      borderColor: colors[idx % colors.length],
      borderWidth: 1.2,
      pointRadius: 0
    }));

    datasets.push({
      label: '+σ_W(n) ∝ √n (Cota Superior)',
      data: data.sigmaBoundPos,
      borderColor: '#ffffff',
      borderWidth: 1.8,
      borderDash: [4, 4],
      pointRadius: 0
    });
    datasets.push({
      label: '-σ_W(n) ∝ √n (Cota Inferior)',
      data: data.sigmaBoundNeg,
      borderColor: '#ffffff',
      borderWidth: 1.8,
      borderDash: [4, 4],
      pointRadius: 0
    });

    state.charts['exp5_rw'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.t_ms,
        datasets: datasets
      },
      options: getDarkChartOptions(
        'Subplot 4: Caminata Aleatoria W[n] con Dispersión Temporal Creciente ∝ √n',
        'Tiempo t [ms]',
        'Amplitud Paseo W[n]'
      )
    });
  }

  function initChartExp5() {
    initChartExp5Var();
  }

  function initChartExp6() {
    const ctx = document.getElementById('chart-exp6');
    if (!ctx || state.charts['exp6']) return;

    const data = StochasticSim.getMonteCarloConvergenceData();
    const maePoints = data.M_vals.map((m, i) => ({ x: m, y: data.mae_mu[i] }));
    const rmsePoints = data.M_vals.map((m, i) => ({ x: m, y: data.rmse_R[i] }));
    const tlcPoints = data.M_vals.map((m, i) => ({ x: m, y: data.tlc_slope[i] }));

    state.charts['exp6'] = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Error Absoluto Medio μ̂_X(t)',
            data: maePoints,
            borderColor: '#fbbf24',
            backgroundColor: '#fbbf24',
            borderWidth: 2,
            pointRadius: 4.5,
            pointHoverRadius: 6.5,
            tension: 0
          },
          {
            label: 'RMSE Autocorrelación R̂_X(τ)',
            data: rmsePoints,
            borderColor: '#00f5a0',
            backgroundColor: '#00f5a0',
            borderWidth: 2,
            pointRadius: 4.5,
            pointHoverRadius: 6.5,
            tension: 0
          },
          {
            label: 'Tasa Asintótica TLC O(1/√M)',
            data: tlcPoints,
            borderColor: '#ffffff',
            borderWidth: 1.8,
            borderDash: [5, 5],
            pointRadius: 0
          }
        ]
      },
      options: {
        ...getDarkChartOptions(
          'Convergencia Monte Carlo y Teorema del Límite Central [Escala Log-Log]',
          'Número de Realizaciones M (Escala Logarítmica)',
          'Error Cuantitativo (Escala Logarítmica)'
        ),
        scales: {
          x: {
            type: 'logarithmic',
            min: 40,
            max: 15000,
            title: { display: true, text: 'Número de Realizaciones M (Escala Logarítmica)', color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.08)' },
            ticks: {
              callback: function(value) {
                const num = Number(value);
                if ([50, 100, 200, 500, 1000, 2000, 5000, 10000].includes(num)) {
                  return num >= 1000 ? (num / 1000) + 'k' : String(num);
                }
                return null;
              },
              color: '#94a3b8'
            }
          },
          y: {
            type: 'logarithmic',
            min: 0.001,
            max: 0.3,
            title: { display: true, text: 'Error Cuantitativo (Escala Logarítmica)', color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.08)' },
            ticks: {
              callback: function(value) {
                const num = Number(value);
                if (num === 0.001 || num === 0.005 || num === 0.01 || num === 0.05 || num === 0.1 || num === 0.2) {
                  return String(num);
                }
                return null;
              },
              color: '#94a3b8'
            }
          }
        }
      }
    });
  }

  // Renderizar gráficos según la diapositiva activa
  function triggerSlideCharts(slideNum) {
    setTimeout(() => {
      if (slideNum === 9) initChartExp1();
      if (slideNum === 10) initChartExp2();
      if (slideNum === 11) initChartExp3();
      if (slideNum === 12) initChartExp4();
      if (slideNum === 13) initChartExp5();
      if (slideNum === 14) initChartExp6();
    }, 150);
  }

  // =========================================================================
  // 4. GESTION DE DIAPOSITIVAS Y NAVEGACION
  // =========================================================================
  function renderSlide(index) {
    if (index < 1) index = 1;
    if (index > state.totalSlides) index = state.totalSlides;
    state.currentSlide = index;

    dom.slides.forEach((slide, idx) => {
      const slideIndex = idx + 1;
      slide.classList.remove('active');
      if (slideIndex === state.currentSlide) {
        slide.classList.add('active');
      }
    });

    // Actualizar contador y barra de progreso
    if (dom.currentSlideNum) dom.currentSlideNum.textContent = state.currentSlide;
    const progressPercent = (state.currentSlide / state.totalSlides) * 100;
    if (dom.progressBar) dom.progressBar.style.width = `${progressPercent}%`;

    // Estado botones navegación
    if (dom.btnPrev) dom.btnPrev.disabled = state.currentSlide === 1;
    if (dom.btnNext) dom.btnNext.disabled = state.currentSlide === state.totalSlides;

    // Actualizar selección en el modal de índice
    updateSidebarActiveState();

    // Activar gráficos interactivos de la diapositiva
    triggerSlideCharts(state.currentSlide);
  }

  function nextSlide() {
    if (state.currentSlide < state.totalSlides) {
      renderSlide(state.currentSlide + 1);
    }
  }

  function prevSlide() {
    if (state.currentSlide > 1) {
      renderSlide(state.currentSlide - 1);
    }
  }

  // =========================================================================
  // 5. MODAL DE INDICE (SIDEBAR SLIDES OVERVIEW)
  // =========================================================================
  function buildSidebarGrid() {
    if (!dom.sidebarGrid) return;
    dom.sidebarGrid.innerHTML = '';

    dom.slides.forEach((slide, idx) => {
      const slideNum = idx + 1;
      const headline = slide.querySelector('.slide-headline') || slide.querySelector('h1');
      const badgeSpeaker = slide.querySelector('.badge-speaker');

      const card = document.createElement('div');
      card.className = 'sidebar-card-item';
      card.setAttribute('data-slide-index', slideNum);

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--mint-neon); font-weight: 700;">Diapositiva ${String(slideNum).padStart(2, '0')}</span>
          <span style="font-size: 0.7rem; color: #34d399;">${badgeSpeaker ? badgeSpeaker.textContent.replace('Expositor: ', '') : ''}</span>
        </div>
        <div style="font-size: 0.82rem; font-weight: 700; color: #fff; line-height: 1.3;">
          ${headline ? headline.textContent : 'Diapositiva ' + slideNum}
        </div>
      `;

      card.addEventListener('click', () => {
        renderSlide(slideNum);
        closeSidebar();
      });

      dom.sidebarGrid.appendChild(card);
    });
  }

  function updateSidebarActiveState() {
    const cards = document.querySelectorAll('.sidebar-card-item');
    cards.forEach(card => {
      const idx = parseInt(card.getAttribute('data-slide-index'), 10);
      card.classList.toggle('active', idx === state.currentSlide);
    });
  }

  function openSidebar() {
    if (dom.sidebarModal) dom.sidebarModal.classList.add('open');
  }

  function closeSidebar() {
    if (dom.sidebarModal) dom.sidebarModal.classList.remove('open');
  }

  // =========================================================================
  // 8. CONMUTADORES DE VISTA: INTERACTIVO (CHART.JS) VS ORIGINAL (MATLAB)
  // =========================================================================
  function setupChartTabSwitchers() {
    const boxes = document.querySelectorAll('.chart-viewer-box');
    boxes.forEach(box => {
      // Ignorar cajas de exp2 y exp5 para manejo especializado
      if (box.querySelector('#tabs-exp2') || box.querySelector('#tabs-exp5')) return;

      const tabInteractive = box.querySelector('.chart-tab-interactive');
      const tabHeatmap = box.querySelector('.chart-tab-heatmap');
      const tabMatlab = box.querySelector('.chart-tab-matlab');
      const canvasEl = box.querySelector('canvas');
      const plotlyEl = box.querySelector('.plotly-container');
      const matlabImg = box.querySelector('.matlab-img-view');
      const zoomHint = box.querySelector('.matlab-zoom-hint');
      const btnRun = box.querySelector('.btn-demo-run');

      if (tabInteractive) {
        tabInteractive.addEventListener('click', () => {
          if (canvasEl) canvasEl.style.display = 'block';
          if (plotlyEl) plotlyEl.style.display = 'none';
          if (matlabImg) matlabImg.style.display = 'none';
          if (zoomHint) zoomHint.style.display = 'none';
          tabInteractive.classList.add('active');
          if (tabHeatmap) tabHeatmap.classList.remove('active');
          if (tabMatlab) tabMatlab.classList.remove('active');
        });
      }

      if (tabHeatmap) {
        tabHeatmap.addEventListener('click', () => {
          if (canvasEl) canvasEl.style.display = 'none';
          if (plotlyEl) {
            plotlyEl.style.display = 'block';
            initChartExp3();
          }
          if (matlabImg) matlabImg.style.display = 'none';
          if (zoomHint) zoomHint.style.display = 'none';
          tabHeatmap.classList.add('active');
          if (tabInteractive) tabInteractive.classList.remove('active');
          if (tabMatlab) tabMatlab.classList.remove('active');
        });
      }

      if (tabMatlab) {
        tabMatlab.addEventListener('click', () => {
          if (canvasEl) canvasEl.style.display = 'none';
          if (plotlyEl) plotlyEl.style.display = 'none';
          if (matlabImg) matlabImg.style.display = 'block';
          if (zoomHint) zoomHint.style.display = 'block';
          tabMatlab.classList.add('active');
          if (tabInteractive) tabInteractive.classList.remove('active');
          if (tabHeatmap) tabHeatmap.classList.remove('active');
        });
      }

      if (btnRun) {
        btnRun.addEventListener('click', () => {
          btnRun.innerHTML = '⏳ Calculando...';
          btnRun.style.opacity = '0.7';
          setTimeout(() => {
            btnRun.innerHTML = '▶ Ejecutar Demo';
            btnRun.style.opacity = '1';
            // Re-render chart animation
            if (canvasEl && canvasEl.id) {
              const chartKey = canvasEl.id.replace('chart-', '');
              if (state.charts[chartKey]) {
                state.charts[chartKey].update();
              }
            }
          }, 350);
        });
      }
    });

    // Manejo especializado para Experimento 2 (Media vs Varianza + MATLAB 300 DPI)
    const tabsExp2 = document.getElementById('tabs-exp2');
    if (tabsExp2) {
      const exp2Buttons = tabsExp2.querySelectorAll('button[data-exp2-tab]');
      const canvasMean = document.getElementById('chart-exp2-mean');
      const canvasVar = document.getElementById('chart-exp2-var');
      const viewerBox = tabsExp2.closest('.chart-viewer-box');
      const imgMatlab = viewerBox ? viewerBox.querySelector('.matlab-img-view') : null;
      const zoomHint = viewerBox ? viewerBox.querySelector('.matlab-zoom-hint') : null;

      exp2Buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          exp2Buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const tabType = btn.getAttribute('data-exp2-tab');
          if (canvasMean) canvasMean.style.display = (tabType === 'mean') ? 'block' : 'none';
          if (canvasVar) canvasVar.style.display = (tabType === 'var') ? 'block' : 'none';
          if (imgMatlab) imgMatlab.style.display = (tabType === 'matlab') ? 'block' : 'none';
          if (zoomHint) zoomHint.style.display = (tabType === 'matlab') ? 'block' : 'none';

          if (tabType === 'mean') initChartExp2Mean();
          if (tabType === 'var') initChartExp2Var();
        });
      });

      const btnRunExp2 = document.getElementById('btn-run-exp2');
      if (btnRunExp2) {
        btnRunExp2.addEventListener('click', () => {
          btnRunExp2.innerHTML = '⏳ Calculando...';
          btnRunExp2.style.opacity = '0.7';
          setTimeout(() => {
            btnRunExp2.innerHTML = '▶ Ejecutar Simulación';
            btnRunExp2.style.opacity = '1';
            if (state.charts['exp2_mean']) state.charts['exp2_mean'].update();
            if (state.charts['exp2_var']) state.charts['exp2_var'].update();
          }, 350);
        });
      }
    }

    // Manejo especializado para Experimento 5 (4 subplots interactivos + MATLAB 300 DPI)
    const tabsExp5 = document.getElementById('tabs-exp5');
    if (tabsExp5) {
      const exp5Buttons = tabsExp5.querySelectorAll('button[data-exp5-tab]');
      const canvasVar = document.getElementById('chart-exp5-var');
      const canvasTraces = document.getElementById('chart-exp5-traces');
      const plotlyMatrix = document.getElementById('plotly-exp5-matrix');
      const canvasRW = document.getElementById('chart-exp5-rw');
      const viewerBox = tabsExp5.closest('.chart-viewer-box');
      const imgMatlab = viewerBox ? viewerBox.querySelector('.matlab-img-view') : null;
      const zoomHint = viewerBox ? viewerBox.querySelector('.matlab-zoom-hint') : null;

      exp5Buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          exp5Buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const tabType = btn.getAttribute('data-exp5-tab');
          if (canvasVar) canvasVar.style.display = (tabType === 'var') ? 'block' : 'none';
          if (canvasTraces) canvasTraces.style.display = (tabType === 'traces') ? 'block' : 'none';
          if (plotlyMatrix) plotlyMatrix.style.display = (tabType === 'matrix') ? 'block' : 'none';
          if (canvasRW) canvasRW.style.display = (tabType === 'rw') ? 'block' : 'none';
          if (imgMatlab) imgMatlab.style.display = (tabType === 'matlab') ? 'block' : 'none';
          if (zoomHint) zoomHint.style.display = (tabType === 'matlab') ? 'block' : 'none';

          if (tabType === 'var') initChartExp5Var();
          if (tabType === 'traces') initChartExp5Traces();
          if (tabType === 'matrix') {
            initChartExp5Matrix();
            if (typeof Plotly !== 'undefined' && plotlyMatrix) {
              Plotly.Plots.resize(plotlyMatrix);
            }
          }
          if (tabType === 'rw') initChartExp5RW();
        });
      });

      const btnRunExp5 = document.getElementById('btn-run-exp5');
      if (btnRunExp5) {
        btnRunExp5.addEventListener('click', () => {
          btnRunExp5.innerHTML = '⏳ Calculando...';
          btnRunExp5.style.opacity = '0.7';
          setTimeout(() => {
            btnRunExp5.innerHTML = '▶ Ejecutar Simulación';
            btnRunExp5.style.opacity = '1';
            if (state.charts['exp5_var']) state.charts['exp5_var'].update();
            if (state.charts['exp5_traces']) state.charts['exp5_traces'].update();
            if (state.charts['exp5_rw']) state.charts['exp5_rw'].update();
          }, 350);
        });
      }
    }
  }

  // =========================================================================
  // 9. LIGHTBOX MODAL PARA IMAGENES MATLAB 300 DPI (ALTA RESOLUCION)
  // =========================================================================
  function openLightbox(src, title) {
    if (!dom.lightboxModal || !dom.lightboxImg) return;
    dom.lightboxImg.src = src;
    if (dom.lightboxTitle) {
      dom.lightboxTitle.textContent = title || 'Visualización de Figura MATLAB (300 DPI)';
    }
    if (dom.lightboxDownload) {
      dom.lightboxDownload.href = src;
    }
    dom.lightboxModal.classList.add('active', 'open');
  }

  function closeLightbox() {
    if (dom.lightboxModal) {
      dom.lightboxModal.classList.remove('active', 'open');
    }
  }

  function setupLightboxEvents() {
    // Abrir modal al hacer clic en cualquier imagen MATLAB o su hint flotante
    document.querySelectorAll('.chart-canvas-area').forEach(area => {
      const img = area.querySelector('.matlab-img-view');
      const hint = area.querySelector('.matlab-zoom-hint');
      if (img) {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', (e) => {
          e.stopPropagation();
          openLightbox(img.src, img.alt);
        });
      }
      if (hint && img) {
        hint.style.cursor = 'pointer';
        hint.style.pointerEvents = 'auto';
        hint.addEventListener('click', (e) => {
          e.stopPropagation();
          openLightbox(img.src, img.alt);
        });
      }
    });

    // Cerrar modal
    if (dom.lightboxClose) {
      dom.lightboxClose.addEventListener('click', closeLightbox);
    }
    const backdrop = document.getElementById('lightbox-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', closeLightbox);
    }
    if (dom.lightboxModal) {
      dom.lightboxModal.addEventListener('click', (e) => {
        // Cerrar si hace clic en el fondo oscuro fuera del cuadro blanco/oscuro
        if (e.target === dom.lightboxModal || e.target.classList.contains('lightbox-backdrop')) {
          closeLightbox();
        }
      });
    }
  }

  // =========================================================================
  // 10. ATAJOS DE TECLADO Y EVENTOS GLOBALES
  // =========================================================================
  function setupEventListeners() {
    if (dom.btnPrev) dom.btnPrev.addEventListener('click', prevSlide);
    if (dom.btnNext) dom.btnNext.addEventListener('click', nextSlide);

    // Botón Iniciar en la portada
    const btnStart = document.getElementById('btn-start-presentation');
    if (btnStart) btnStart.addEventListener('click', () => renderSlide(2));

    // Botones de acción superior
    if (dom.btnOverview) dom.btnOverview.addEventListener('click', openSidebar);
    if (dom.btnCloseSidebar) dom.btnCloseSidebar.addEventListener('click', closeSidebar);
    if (dom.btnPrintPdf) dom.btnPrintPdf.addEventListener('click', () => window.print());

    // Pantalla completa
    if (dom.btnFullscreen) {
      dom.btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => console.log(err));
        } else {
          document.exitFullscreen().catch(err => console.log(err));
        }
      });
    }

    // Teclas de navegación
    document.addEventListener('keydown', (e) => {
      if (dom.lightboxModal && dom.lightboxModal.classList.contains('open')) {
        if (e.key === 'Escape') closeLightbox();
        return;
      }

      if (dom.sidebarModal && dom.sidebarModal.classList.contains('open')) {
        if (e.key === 'Escape') closeSidebar();
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ': // Barra espaciadora
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
          break;
        case 'o':
        case 'O':
        case 'm':
        case 'M':
          e.preventDefault();
          if (dom.sidebarModal && dom.sidebarModal.classList.contains('open')) {
            closeSidebar();
          } else {
            openSidebar();
          }
          break;
        case 'Escape':
          closeSidebar();
          break;
      }
    });
  }

  // =========================================================================
  // 7. INICIALIZACION GLOBAL
  // =========================================================================
  function init() {
    state.totalSlides = dom.slides.length;
    if (dom.totalSlidesNum) dom.totalSlidesNum.textContent = state.totalSlides;

    initBackgroundCanvas();
    setupEventListeners();
    setupLightboxEvents();
    setupChartTabSwitchers();
    buildSidebarGrid();
    renderSlide(1);
  }

  init();
});