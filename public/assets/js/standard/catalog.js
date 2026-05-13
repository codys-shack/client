$(document).ready(function () {
    // Client-side access to shared folder
    fetch('/shared/games.json')
        .then(response => response.json())
        .then(data => {
            console.log('Client-side access to shared games:', data.games);
            const container = $('.card-container');
            data.games.forEach(game => {
                const card = $(`<button class="card" style="background-image: url('../assets/images/catalog-placeholder-assets/`+game.id+`.png');">`).append($('<h2>').text(game.name));
                container.append(card);
            });
        })
        .catch(error => console.error('Error fetching shared data:', error));
});
