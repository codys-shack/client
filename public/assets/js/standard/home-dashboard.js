import { requireAuth } from "../auth/auth-guard.js";
import { detectBrowser } from "../utils/browser.js";

requireAuth().then(user => {
    const currentBrowser = detectBrowser();
    const browserNames = { chrome: 'Chrome', firefox: 'Firefox', safari: 'Safari' };

    fetch('/shared/games.json')
        .then(response => response.json())
        .then(data => {
            const container = $('#game-list');
            data.games.forEach(game => {
                const supported = !game.browsers || game.browsers.includes(currentBrowser);
                if (supported) {
                    const card = $(`<div class="card" style="background-image: url('../assets/images/catalog-placeholder-assets/${game.id}.png');">`).append($('<h2>').text(game.name));
                    card.on('click', function() {
                        sessionStorage.setItem('playGameId', game.id);
                        window.location.href = '/play';
                    });
                    container.append(card);
                } else {
                    const names = game.browsers.map(b => browserNames[b] || b);
                    const div = $(`<div class="card card-disabled" style="background-image: url('../assets/images/catalog-placeholder-assets/${game.id}.png');">`)
                        .append($('<h2>').text(game.name))
                        .append($(`<span class="card-browser-hint">Requires ${names.join(', ')}</span>`));
                    container.append(div);
                }
            });
        })
        .catch(error => console.error('Error fetching shared data:', error));
}).catch(() => {});
