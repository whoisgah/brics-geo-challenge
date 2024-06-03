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
            resetMap();
        });

    const countries = ["AO", "BF", "BI", "BJ", "BW", "CD", "CF", "CG", "CI", "CM", "CV", "DJ", "DZ", "EG", "EH", "ER", "ET", "GA", "GH", "GM", "GN", "GQ", "GW", "KE", "KM", "LR", "LS", "LY", "MA", "MG", "ML", "MR", "MU", "MW", "MZ", "NA", "NE", "NG", "RE", "RW", "SC", "SD", "SH", "SL", "SN", "SO", "SS", "ST", "SZ", "TD", "TG", "TN", "TZ", "UG", "YT", "ZA", "ZM", "ZW", "AZ", "BH", "CY", "IQ", "IR", "IL", "JO", "KW", "LB", "OM", "PS", "QA", "SA", "SY", "TR", "AE", "YE"];
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

            // Variável para armazenar o valor de incremento/decremento
            let incrementValue = 0;
            let fillColor = '';

            // Definir o valor de incremento/decremento e a cor do preenchimento
            if (correctCountries.includes(selectedCountry)) {
                incrementValue = 20;
                fillColor = '#F06868';
            } else if (orangeCountries.includes(selectedCountry)) {
                incrementValue = -5;
                fillColor = '#FF9C6D';
            } else if (yellowCountries.includes(selectedCountry)) {
                incrementValue = -5;
                fillColor = '#EDF798';
            } else if (blueCountries.includes(selectedCountry)) {
                incrementValue = -5;
                fillColor = '#80D6FF';
            } else if (darkBlueCountries.includes(selectedCountry)) {
                incrementValue = -5;
                fillColor = '#00215E';
            }

            // Aplicar a cor de preenchimento a todos os elementos SVG do país selecionado
            sameNameCountries.forEach(country => {
                country.style.fill = fillColor;
            });

            // Incrementar a pontuação uma única vez por país clicado
            incrementScore(incrementValue);
        }
    }

    let score = 0;
    let scoredCountries = 0;
    let errorCountries = 0;

    function incrementScore(int) {
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
        const countryCode = event.target.getAttribute('id');
        if (countries.includes(countryCode)) {
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
    }


    function setupZoomAndPan() {
        const svgElement = document.querySelector('#map-container svg');
        let viewBox = svgElement.getAttribute('viewBox').split(' ').map(Number);
        const initialViewBox = viewBox.slice();
        const zoomFactor = 1.2;
        const minZoomWidth = initialViewBox[2] * 0.3;
        const minZoomHeight = initialViewBox[3] * 0.3;
        const maxZoomWidth = initialViewBox[2] * 2;
        const maxZoomHeight = initialViewBox[3] * 2;


        svgElement.setAttribute('data-initial-viewBox', viewBox.join(' '));

        svgElement.addEventListener('wheel', function (event) {
            event.preventDefault();
            zoom(event.offsetX, event.offsetY, event.deltaY > 0 ? zoomFactor : 1 / zoomFactor);
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

        svgElement.addEventListener('touchstart', handleTouchStart, { passive: false });
        svgElement.addEventListener('touchmove', handleTouchMove, { passive: false });
        svgElement.addEventListener('touchend', handleTouchEnd, { passive: false });

        document.getElementById('zoom-in').addEventListener('click', function () {
            zoom(svgElement.clientWidth / 2, svgElement.clientHeight / 2, 1 / zoomFactor);
        });

        document.getElementById('zoom-out').addEventListener('click', function () {
            zoom(svgElement.clientWidth / 2, svgElement.clientHeight / 2, zoomFactor);
        });

        function zoom(x, y, factor) {
            const [minX, minY, width, height] = viewBox;
            const mouseX = x / svgElement.clientWidth * width + minX;
            const mouseY = y / svgElement.clientHeight * height + minY;

            const newWidth = width * factor;
            const newHeight = height * factor;

            // Ensure the new width and height do not go below the minimum zoom values
            if (newWidth >= minZoomWidth && newWidth <= maxZoomWidth && newHeight >= minZoomHeight && newHeight <= maxZoomHeight) {
                viewBox = [
                    mouseX - (mouseX - minX) * factor,
                    mouseY - (mouseY - minY) * factor,
                    newWidth,
                    newHeight
                ];
                svgElement.setAttribute('viewBox', viewBox.join(' '));
            }
        }

        let lastTouchDistance = null;

        function handleTouchStart(event) {
            if (event.touches.length === 2) {
                lastTouchDistance = getDistance(event.touches[0], event.touches[1]);
                isPanning = false;
            } else if (event.touches.length === 1) {
                isPanning = true;
                startX = event.touches[0].clientX;
                startY = event.touches[0].clientY;
            }
        }

        function handleTouchMove(event) {
            event.preventDefault();
            if (event.touches.length === 2) {
                const currentTouchDistance = getDistance(event.touches[0], event.touches[1]);
                const zoomFactor = 1 + (lastTouchDistance - currentTouchDistance) / initialViewBox[2];
                const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
                const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
                zoom(centerX, centerY, zoomFactor);
                lastTouchDistance = currentTouchDistance;
            } else if (isPanning && event.touches.length === 1) {
                const dx = (startX - event.touches[0].clientX) * (viewBox[2] / svgElement.clientWidth);
                const dy = (startY - event.touches[0].clientY) * (viewBox[3] / svgElement.clientHeight);
                viewBox[0] += dx;
                viewBox[1] += dy;
                startX = event.touches[0].clientX;
                startY = event.touches[0].clientY;
                svgElement.setAttribute('viewBox', viewBox.join(' '));
            }
        }

        function handleTouchEnd(event) {
            if (event.touches.length < 2) {
                lastTouchDistance = null;
            }
            if (event.touches.length === 0) {
                isPanning = false;
            }
        }

        function getDistance(touch1, touch2) {
            return Math.sqrt(Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2));
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