/* Venomous Steel — światło na stali.
   Zasada: płyta jest ciężka. Odblask nie skacze za kursorem, tylko go dogania
   (interpolacja ~0,07/klatkę). Snapping do kursora = kicz; opóźnienie = masa.
   Bez WebGL i bez 3D w przeglądarce — warunek z ZALOZENIA-TECHNICZNE.md. */

(function () {
  'use strict';

  var korzen = document.documentElement;
  var spokoj = window.matchMedia('(prefers-reduced-motion: reduce)');
  var maPointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  var cel = { x: 50, y: 34 };
  var ma  = { x: 50, y: 34 };
  var kursorByl = false;
  var klatka = null;

  function ustaw(x, y) {
    korzen.style.setProperty('--mx', x.toFixed(2) + '%');
    korzen.style.setProperty('--my', y.toFixed(2) + '%');
  }

  /* Ruch własny światła, gdy nikt nie rusza myszką i na telefonie.
     Dwie niewspółmierne sinusoidy — tor się nie zapętla w widoczny sposób. */
  function dryf(t) {
    var s = t / 1000;
    cel.x = 50 + Math.sin(s * 0.11) * 26 + Math.sin(s * 0.047) * 9;
    cel.y = 36 + Math.cos(s * 0.083) * 13;
  }

  /* Elementy, które potrzebują światła w swoim własnym układzie, a nie w układzie
     okna: maska odsłaniająca pająka i połysk sunący po ostrzu. Bez tego reveal
     rozjeżdża się z kursorem, bo maska liczy procenty od krawędzi elementu. */
  var lokalne = document.querySelectorAll('[data-swiatlo-lokalne]');

  function przelicz() {
    if (!lokalne.length) return;
    var px = (ma.x / 100) * window.innerWidth;
    var py = (ma.y / 100) * window.innerHeight;
    for (var i = 0; i < lokalne.length; i++) {
      var el = lokalne[i];
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      el.style.setProperty('--lx', (((px - r.left) / r.width) * 100).toFixed(2) + '%');
      el.style.setProperty('--ly', (((py - r.top) / r.height) * 100).toFixed(2) + '%');
    }
  }

  function petla(t) {
    if (!kursorByl) dryf(t);
    ma.x += (cel.x - ma.x) * 0.07;
    ma.y += (cel.y - ma.y) * 0.07;
    ustaw(ma.x, ma.y);
    przelicz();
    klatka = requestAnimationFrame(petla);
  }

  function zKursora(e) {
    kursorByl = true;
    cel.x = (e.clientX / window.innerWidth) * 100;
    cel.y = (e.clientY / window.innerHeight) * 100;
  }

  if (spokoj.matches) {
    ustaw(cel.x, cel.y);            // światło stoi, płyta dalej jest stalą
    ma.x = cel.x; ma.y = cel.y;
    przelicz();
  } else {
    window.addEventListener('pointermove', zKursora, { passive: true });
    window.addEventListener('pointerdown', zKursora, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(klatka);
      } else {
        klatka = requestAnimationFrame(petla);
      }
    });
    klatka = requestAnimationFrame(petla);
  }

  /* Przyciski mają własny, lokalny odblask — ten jeden nadąża za kursorem,
     bo to mała, lekka płytka, nie płyta. */
  if (maPointer.matches && !spokoj.matches) {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        btn.style.setProperty('--bx', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
      }, { passive: true });
      btn.addEventListener('pointerleave', function () {
        btn.style.setProperty('--bx', '50%');
      });
    });
  }
})();
