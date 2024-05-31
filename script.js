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

    function onCountryClick(event) {
        const selectedCountry = event.target.id; // ou event.target.getAttribute('id');

        // Buscar todos os países com o mesmo nome
        const sameNameCountries = document.querySelectorAll(`[id="${selectedCountry}"]`);

        // Pintar todos os países com o mesmo nome
        sameNameCountries.forEach(country => {
            if (correctCountries.includes(selectedCountry)) {
                country.style.fill = '#F06868';
            } else if (orangeCountries.includes(selectedCountry)) {
                country.style.fill = '#FF9C6D';
            } else if (yellowCountries.includes(selectedCountry)) {
                country.style.fill = '#EDF798';
            } else if (blueCountries.includes(selectedCountry)) {
                country.style.fill = '#80D6FF';
            } else if (darkBlueCountries.includes(selectedCountry)) {
                country.style.fill = '#00215E';
            }
        });
    }


    function resetMap() {
        console.log('resetMap');
        // Resetar as cores dos países para a cor padrão
        countries.forEach(country => {
            const countryElements = document.querySelectorAll(`[id="${country}"]`);
            countryElements.forEach(countryElement => {
                if (countryElement) {
                    countryElement.style.fill = '#9790ee';
                }
            });
        });
    
        // Resetar o viewBox para o valor inicial
        const svgElement = document.querySelector('#map-container svg');
        const initialViewBox = svgElement.getAttribute('data-initial-viewBox');
        svgElement.setAttribute('viewBox', initialViewBox);
    }
    

    function showCountryName(event) {
        const countryName = event.target.getAttribute('name');
        const map_tooltip = document.createElement('div');
        map_tooltip.textContent = countryName;
        map_tooltip.classList.add('map_tooltip');
        map_tooltip.style.top = `${event.clientY}px`;
        map_tooltip.style.left = `${event.clientX}px`;
        document.body.appendChild(map_tooltip);

        event.target.addEventListener('mouseout', function () {
            if (map_tooltip.parentNode) {
                map_tooltip.parentNode.removeChild(map_tooltip);
            }
        }, { once: true });
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
            const mouseY = offsetY / svgElement.clientHeight * height + minY;

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

        if (currentTheme === 'dark') {
            lightIcon.style.display = 'none';
            darkIcon.style.display = 'inline';
            document.body.style.backgroundColor = '#222'; // Cor de fundo para o tema escuro
            document.documentElement.style.setProperty('--icon-fill-color', '#fff'); // Altera a cor de preenchimento dos ícones para branco
            currentTheme = 'light';
            // Também pode ser feita a mudança de cores dos elementos SVG aqui
        } else {
            lightIcon.style.display = 'inline';
            darkIcon.style.display = 'none';
            document.body.style.backgroundColor = '#f4f4fe'; // Cor de fundo para o tema claro
            document.documentElement.style.setProperty('--icon-fill-color', '#000'); // Altera a cor de preenchimento dos ícones para preto
            currentTheme = 'dark';
            // Também pode ser feita a mudança de cores dos elementos SVG aqui
        }
    }



});
