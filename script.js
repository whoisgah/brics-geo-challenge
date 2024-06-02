document.addEventListener('DOMContentLoaded', function () {
    // Carregar o SVG no contêiner
    fetch('africa-oriente.svg')
        .then(response => response.text())
        .then(data => {
            document.getElementById('map-container').innerHTML = data;
            addInteractivity();
            setupZoomAndPan();
            toggleTheme();
            document.getElementById('reset-button').addEventListener('click', resetMap);
            document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
            const myModal = new bootstrap.Modal(document.getElementById('exampleModal'));
            myModal.show();
        });

    const countries = ["AO", "BF", "BI", "BJ", "BW", "CD", "CF", "CG", "CI", "CM", "CV", "DJ", "DZ", "EG", "EH", "ER", "ET", "GA", "GH", "GM", "GN", "GQ", "GW", "KE", "KM", "LR", "LS", "LY", "MA", "MG", "ML", "MR", "MU", "MW", "MZ", "NA", "NE", "NG", "RE", "RW", "SC", "SD", "SH", "SL", "SN", "SO", "SS", "ST", "SZ", "TD", "TG", "TN", "TZ", "UG", "YT", "ZA", "ZM", "ZW", "AF", "AM", "AZ", "BH", "CY", "GE", "IQ", "IR", "IL", "JO", "KW", "LB", "OM", "PS", "QA", "SA", "SY", "TR", "AE", "YE"];
    const orangeCountries = ["DJ", "ER", "IQ", "JO", "KE", "LY", "OM", "QA", "SD", "SO", "SS", "SY", "TR", "YE", "BH", "KW", "IL"];
    const yellowCountries = ["SC", "KM", "BI", "CF", "CD", "CY", "DZ", "LB", "NE", "OS", "RW", "SY", "TD", "TN", "TR", "TZ", "UG", "PS"];
    const blueCountries = ["AO", "BF", "BJ", "CM", "CG", "EH", "MA", "MG", "ML", "MR", "MZ", "MW", "NG", "ZM"];
    const darkBlueCountries = ["ST", "GM", "CV", "GQ", "MU", "BW", "CI", "EQ", "GA", "GH", "GN", "GW", "LR", "LS", "NA", "RW", "SL", "SN", "SZ", "TG", "ZA", "ZW"];
    const correctCountries = ['SA', 'EG', 'AE', 'ET', 'IR'];

    function addInteractivity() {
        const paths = document.querySelectorAll('#map-container svg path');
        paths.forEach(path => {
            path.addEventListener('click', onCountryClick);
            path.addEventListener('mouseover', showCountryName);
        });
    }

    let clickedCountries = [];

    function onCountryClick(event) {
        const selectedCountry = event.target.id; // ou event.target.getAttribute('id');

        // Verifica se o país já foi clicado antes
        if (!clickedCountries.includes(selectedCountry)) {
            // Adiciona o país à lista de países clicados
            clickedCountries.push(selectedCountry);

            // Buscar todos os países com o mesmo nome
            const sameNameCountries = document.querySelectorAll(`[id="${selectedCountry}"]`);
            // Pintar todos os países com o mesmo nome
            sameNameCountries.forEach(country => {
                if (correctCountries.includes(selectedCountry)) {
                    incrementScore(20);
                    country.style.fill = '#F06868';
                } else if (orangeCountries.includes(selectedCountry)) {
                    incrementScore(-5);
                    country.style.fill = '#FF9C6D';
                } else if (yellowCountries.includes(selectedCountry)) {
                    incrementScore(-5);
                    country.style.fill = '#EDF798';
                } else if (blueCountries.includes(selectedCountry)) {
                    incrementScore(-5);
                    country.style.fill = '#80D6FF';
                } else if (darkBlueCountries.includes(selectedCountry)) {
                    incrementScore(-5);
                    country.style.fill = '#00215E';
                }
            });
        }
    }

    let score = 0;
    let scoredCountries = 0;
    let errorCountries = 0;
    function incrementScore(int, country) {
        score += int;
        if (int > 0) {
            scoredCountries += 1;
        } else {
            errorCountries += 1;
        }
        document.getElementById('scoredCountries').textContent = scoredCountries.toString();
        document.getElementById('errorCountries').textContent = errorCountries.toString();
        document.getElementById('score').textContent = score.toString();
    }

    function resetMap() {
        console.log('resetMap');
        // Resetar as cores dos países para a cor padrão
        countries.forEach(country => {
            const countryElements = document.querySelectorAll(`[id="${country}"]`);
            countryElements.forEach(countryElement => {
                if (countryElement) {
                    countryElement.style.fill = '#ffb0ee';
                }
            });
        });
        // Resetar o viewBox para o valor inicial
        score = 0;
        scoredCountries = 0;
        errorCountries = 0;
        document.getElementById('scoredCountries').textContent = scoredCountries.toString();
        document.getElementById('errorCountries').textContent = errorCountries.toString();
        document.getElementById('score').textContent = score.toString();
        clickedCountries = [];
        const svgElement = document.querySelector('#map-container svg');
        const initialViewBox = svgElement.getAttribute('data-initial-viewBox');
        svgElement.setAttribute('viewBox', initialViewBox);
    }


    function showCountryName(event) {
        const countryName = event.target.getAttribute('name');
        const map_tooltip = document.createElement('div');
        map_tooltip.textContent = countryName;
        map_tooltip.classList.add('map_tooltip');
        document.body.appendChild(map_tooltip);
        function moveTooltip(e) {
            map_tooltip.style.top = `${e.clientY - 5}px`; // Adicionando um offset para melhor visibilidade
            map_tooltip.style.left = `${e.clientX}px`;
        }
        function removeTooltip() {
            map_tooltip.remove();
            event.target.removeEventListener('mousemove', moveTooltip);
            event.target.removeEventListener('mouseout', removeTooltip);
        }
        event.target.addEventListener('mousemove', moveTooltip);
        event.target.addEventListener('mouseout', removeTooltip, { once: true });
        // Posicionar a tooltip inicialmente
        moveTooltip(event);
    }


    function setupZoomAndPan() {
        const svgElement = document.querySelector('#map-container svg');
        let viewBox = svgElement.getAttribute('viewBox').split(' ').map(Number);
        svgElement.setAttribute('data-initial-viewBox', viewBox.join(' '));
        const zoomFactor = 1.2;
        svgElement.addEventListener('wheel', function (event) {
            event.preventDefault();
            const { offsetX, offsetY, deltaY } = event;
            const zoom = deltaY > 0 ? zoomFactor : 1 / zoomFactor;
            const [minX, minY, width, height] = viewBox;
            const mouseX = offsetX / svgElement.clientWidth * width + minX;
            const mouseY = offsetY / svgElement.clientHeight * height + minY
            viewBox = [
                mouseX - (mouseX - minX) * zoom,
                mouseY - (mouseY - minY) * zoom,
                width * zoom,
                height * zoom
            ];
            svgElement.setAttribute('viewBox', viewBox.join(' '));
        });

        let isPanning = false;
        let startX, startY;

        svgElement.addEventListener('mousedown', function (event) {
            isPanning = true;
            startX = event.clientX;
            startY = event.clientY;
        });

        svgElement.addEventListener('mousemove', function (event) {
            if (!isPanning) return;
            const dx = (startX - event.clientX) * (viewBox[2] / svgElement.clientWidth);
            const dy = (startY - event.clientY) * (viewBox[3] / svgElement.clientHeight);
            viewBox[0] += dx;
            viewBox[1] += dy;
            startX = event.clientX;
            startY = event.clientY;
            svgElement.setAttribute('viewBox', viewBox.join(' '));
        });

        svgElement.addEventListener('mouseup', function () {
            isPanning = false;
        });

        svgElement.addEventListener('mouseleave', function () {
            isPanning = false;
        });

        document.getElementById('zoom-in').addEventListener('click', function () {
            zoom(svgElement, 1 / zoomFactor);
        });


        document.getElementById('zoom-out').addEventListener('click', function () {
            zoom(svgElement, zoomFactor);
        });

        function zoom(svgElement, zoomFactor) {
            const [minX, minY, width, height] = viewBox;

            const centerX = minX + width / 2;
            const centerY = minY + height / 2;

            viewBox = [
                centerX - (centerX - minX) * zoomFactor,
                centerY - (centerY - minY) * zoomFactor,
                width * zoomFactor,
                height * zoomFactor
            ];
            svgElement.setAttribute('viewBox', viewBox.join(' '));
        }
    }

    let currentTheme = 'dark'; // Tema inicial

    // Função para alternar entre os temas

    function toggleTheme() {
        const lightIcon = document.getElementById('light-theme-icon');
        const darkIcon = document.getElementById('dark-theme-icon');
        const modal = document.querySelector('#exampleModal .modal-content');
        const buttonZoomIn = document.getElementById('zoom-in');
        const buttonZoomOut = document.getElementById('zoom-out');
        const buttonReset = document.getElementById('reset-button');

        if (currentTheme === 'dark') {
            lightIcon.style.display = 'none';
            darkIcon.style.display = 'inline';
            document.body.style.backgroundColor = '#0d1e36'; // Cor de fundo para o tema escuro
            document.documentElement.style.setProperty('--icon-fill-color', '#fff'); // Altera a cor de preenchimento dos ícones para branco
            document.documentElement.style.setProperty('--bs-body-bg', '#222');
            document.documentElement.style.setProperty('--bs-body-color', '#fff');
            document.documentElement.style.setProperty('--bs-modal-color', '#fff');
            document.documentElement.style.setProperty('--bs-btn-border-color', '#fff');
            buttonZoomIn.style.borderColor = '#fff';
            buttonZoomOut.style.borderColor = '#fff';
            buttonReset.style.borderColor = '#fff';

            modal.style.color = "#fff";
            currentTheme = 'light';
        } else {
            lightIcon.style.display = 'inline';
            darkIcon.style.display = 'none';
            document.body.style.backgroundColor = '#85a8d3'; // Cor de fundo para o tema claro
            document.documentElement.style.setProperty('--icon-fill-color', '#000'); // Altera a cor de preenchimento dos ícones para preto
            document.documentElement.style.setProperty('--bs-body-bg', '#f4f4fe');
            document.documentElement.style.setProperty('--bs-body-color', '#000');
            document.documentElement.style.setProperty('--bs-modal-color', '#000');
            document.documentElement.style.setProperty('--bs-btn-border-color', '#000');
            buttonZoomIn.style.borderColor = '#000';
            buttonZoomOut.style.borderColor = '#000';
            buttonReset.style.borderColor = '#000';

            modal.style.color = "#000";
            currentTheme = 'dark';
        }
    }
});