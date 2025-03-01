// Add window resize event listener to handle responsive canvas
window.addEventListener('resize', function() {
    // Resize any active canvas elements
    const diffusionCanvas = document.querySelector('#diffusion-animation canvas');
    const transformerCanvas = document.querySelector('#transformer-animation canvas');
    
    if (diffusionCanvas) {
        const container = document.getElementById('diffusion-animation');
        diffusionCanvas.width = container.clientWidth;
        diffusionCanvas.height = container.clientHeight;
    }
    
    if (transformerCanvas) {
        const container = document.getElementById('transformer-animation');
        transformerCanvas.width = container.clientWidth;
        transformerCanvas.height = container.clientHeight;
        // Redraw connections if transformer animation is active
        if (container.classList.contains('active')) {
            // Get the canvas context
            const ctx = transformerCanvas.getContext('2d');
            ctx.clearRect(0, 0, transformerCanvas.width, transformerCanvas.height);
            
            // Find elements by class names
            const tokenElements = document.querySelectorAll('.transformer-token');
            const attentionElements = document.querySelectorAll('.attention-head');
            const outputElements = document.querySelectorAll('.output-token');
            
            // If all elements exist, redraw connections
            if (tokenElements.length > 0 && attentionElements.length > 0) {
                drawAttentionConnections(ctx, tokenElements, attentionElements);
            }
            
            if (attentionElements.length > 0 && outputElements.length > 0) {
                drawOutputConnections(ctx, attentionElements, outputElements);
            }
        }
    }
    
    // Check for heading overflow and adjust if needed
    adjustHeadingDisplay();
});

// Function to check and adjust headings if they're being cut off
function adjustHeadingDisplay() {
    const headings = document.querySelectorAll('h1, h2, h3');
    
    headings.forEach(heading => {
        // Remove any explicitly set height constraints
        heading.style.maxHeight = 'none';
        heading.style.minHeight = 'auto';
        heading.style.height = 'auto';
        
        // If it's in a section-header, also adjust that container
        const sectionHeader = heading.closest('.section-header');
        if (sectionHeader) {
            sectionHeader.style.minHeight = 'auto';
            sectionHeader.style.height = 'auto';
            
            // Ensure header-top has enough space
            const headerTop = sectionHeader.querySelector('.header-top');
            if (headerTop) {
                headerTop.style.minHeight = 'auto';
                headerTop.style.marginBottom = '8px';
            }
        }
    });
    
    // Ensure the sections have proper spacing
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.overflow = 'visible';
    });
}

// Call this once on page load to fix any initial issues
document.addEventListener('DOMContentLoaded', function() {
    // Allow the browser to render first, then adjust layout
    setTimeout(adjustHeadingDisplay, 100);
    
    // Make sure all section headers are properly structured
    ensureHeaderStructure();
});

// Function to ensure all section headers have the correct structure
function ensureHeaderStructure() {
    const sectionHeaders = document.querySelectorAll('.section-header');
    
    sectionHeaders.forEach(header => {
        // Check if the header already has the header-top div
        if (!header.querySelector('.header-top')) {
            // Get the raw content
            const headerContent = header.innerHTML;
            
            // Check if there's an h2 directly in the section-header
            const h2 = header.querySelector('h2');
            const badge = header.querySelector('.badge');
            
            if (h2 && badge) {
                // Get any icon inside the h2
                const icon = h2.querySelector('i');
                const iconHTML = icon ? icon.outerHTML + ' ' : '';
                const h2Text = h2.textContent.trim();
                
                // Create a new structure
                const newHTML = `
                    <div class="header-top">
                        ${icon ? icon.outerHTML : ''}
                        <h2>${h2Text.replace(icon ? icon.textContent.trim() : '', '').trim()}</h2>
                    </div>
                    ${badge.outerHTML}
                `;
                
                // Update the header content
                header.innerHTML = newHTML;
            }
        }
    });
}

document.getElementById('start-diffusion').addEventListener('click', () => {
    startDiffusionAnimation();
});

document.getElementById('start-transformer').addEventListener('click', () => {
    startTransformerAnimation();
});

function startDiffusionAnimation() {
    const container = document.getElementById('diffusion-animation');
    container.innerHTML = '';

    // Add active class
    container.classList.add('active');
    
    // Create a container for the animation elements
    const animationWrapper = document.createElement('div');
    animationWrapper.style.width = '100%';
    animationWrapper.style.height = '100%';
    animationWrapper.style.position = 'relative';
    container.appendChild(animationWrapper);
    
    // Check screen size and adjust UI elements
    const isMobile = window.innerWidth < 576;
    const isTablet = window.innerWidth >= 576 && window.innerWidth < 992;
    
    // Create a step counter display
    const stepCounter = document.createElement('div');
    stepCounter.style.position = 'absolute';
    stepCounter.style.top = '10px';
    stepCounter.style.right = '10px';
    stepCounter.style.padding = isMobile ? '3px 6px' : '5px 10px';
    stepCounter.style.background = 'rgba(0, 0, 0, 0.7)';
    stepCounter.style.color = 'white';
    stepCounter.style.borderRadius = '5px';
    stepCounter.style.fontSize = isMobile ? '12px' : '14px';
    stepCounter.style.zIndex = '2';
    stepCounter.textContent = 'Step: 0/5';
    animationWrapper.appendChild(stepCounter);
    
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.style.position = 'absolute';
    progressBar.style.bottom = '10px';
    progressBar.style.left = '10px';
    progressBar.style.width = 'calc(100% - 20px)';
    progressBar.style.height = isMobile ? '4px' : '6px';
    progressBar.style.background = '#ddd';
    progressBar.style.borderRadius = '3px';
    progressBar.style.overflow = 'hidden';
    progressBar.style.zIndex = '2';
    animationWrapper.appendChild(progressBar);
    
    const progressFill = document.createElement('div');
    progressFill.style.height = '100%';
    progressFill.style.width = '0%';
    progressFill.style.background = '#007BFF';
    progressFill.style.transition = 'width 0.3s ease';
    progressBar.appendChild(progressFill);
    
    // Create text area with responsive font size
    const mainTextArea = document.createElement('div');
    mainTextArea.style.position = 'absolute';
    mainTextArea.style.top = '50%';
    mainTextArea.style.left = '50%';
    mainTextArea.style.transform = 'translate(-50%, -50%)';
    mainTextArea.style.textAlign = 'center';
    mainTextArea.style.width = '90%';
    mainTextArea.style.fontSize = isMobile ? '16px' : (isTablet ? '20px' : '24px');
    mainTextArea.style.opacity = '0';
    mainTextArea.style.zIndex = '2';
    animationWrapper.appendChild(mainTextArea);
    
    // Create explanation text with responsive positioning
    const explanationText = document.createElement('div');
    explanationText.style.position = 'absolute';
    explanationText.style.top = isMobile ? '70%' : '75%';
    explanationText.style.left = '50%';
    explanationText.style.transform = 'translateX(-50%)';
    explanationText.style.textAlign = 'center';
    explanationText.style.width = '90%';
    explanationText.style.fontSize = isMobile ? '11px' : '14px';
    explanationText.style.color = '#666';
    explanationText.style.opacity = '0';
    explanationText.style.zIndex = '2';
    explanationText.style.backgroundColor = 'rgba(255,255,255,0.8)';
    explanationText.style.padding = isMobile ? '3px 5px' : '5px 8px';
    explanationText.style.borderRadius = '4px';
    explanationText.style.overflow = 'hidden';
    explanationText.style.textOverflow = 'ellipsis';
    explanationText.style.maxHeight = isMobile ? '40px' : '60px';
    animationWrapper.appendChild(explanationText);
    
    // Create noise particles
    const noiseContainer = document.createElement('div');
    noiseContainer.style.position = 'absolute';
    noiseContainer.style.top = '0';
    noiseContainer.style.left = '0';
    noiseContainer.style.width = '100%';
    noiseContainer.style.height = '100%';
    noiseContainer.style.pointerEvents = 'none';
    animationWrapper.appendChild(noiseContainer);
    
    // Adjust particle count based on screen size
    const particleCount = isMobile ? 50 : (isTablet ? 75 : 100);
    
    // Create random noise particles
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'noise-particle';
        particle.style.position = 'absolute';
        particle.style.width = isMobile ? '2px' : '3px';
        particle.style.height = isMobile ? '2px' : '3px';
        particle.style.background = '#333';
        particle.style.borderRadius = '50%';
        particle.style.opacity = '0.8';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        noiseContainer.appendChild(particle);
    }
    
    // Final target text and intermediate states
    // Select appropriate sentence length based on screen size
    let targetText;
    if (isMobile) {
        targetText = "The quick brown fox";
    } else if (isTablet) {
        targetText = "The quick brown fox jumps";
    } else {
        targetText = "The quick brown fox jumps over the lazy dog";
    }
    
    // Create different stages of text denoising (from random to coherent)
    // Generate dynamic stages based on target text
    const textStages = generateDiffusionStages(targetText, 5);
    
    // Create descriptions for each stage
    const stageDescriptions = [
        "Starting with high noise level",
        "First denoising step",
        "More denoising and clarity",
        "Further refinement",
        "Final coherent output"
    ];
    
    // Begin the animation sequence
    gsap.to(mainTextArea, {
        opacity: 1,
        duration: 1,
        onComplete: () => {
            // First display a random noise of characters
            const randomChars = Array.from({length: targetText.length}, () => 
                String.fromCharCode(Math.floor(Math.random() * 94) + 33)
            ).join('');
            
            mainTextArea.innerHTML = randomChars;
            
            gsap.to(explanationText, {
                opacity: 1,
                duration: 0.5
            });
            
            // Start diffusion animation sequence
            let currentStep = 0;
            const totalSteps = textStages.length;
            
            function runDiffusionStep() {
                if (currentStep >= totalSteps) {
                    // Animation complete
                    setTimeout(() => {
                        container.classList.remove('active');
                    }, 1000);
                    return;
                }

                // Update step counter
                stepCounter.textContent = `Step: ${currentStep + 1}/${totalSteps}`;
                
                // Update progress bar
                progressFill.style.width = `${((currentStep + 1) / totalSteps) * 100}%`;
                
                // Reduce noise particles
                const particles = noiseContainer.querySelectorAll('.noise-particle');
                particles.forEach((particle, index) => {
                    if (index % (currentStep + 1) === 0) {
                        gsap.to(particle, {
                            opacity: 0,
                            duration: 0.5,
                            ease: "power2.out"
                        });
                    }
                });
                
                // Apply text denoising step
                const characters = textStages[currentStep].split('');
                
                // Update character by character with small delays
                // Adjust delay based on screen size
                const charDelay = isMobile ? 10 : (isTablet ? 15 : 20);
                
                characters.forEach((char, index) => {
                    setTimeout(() => {
                        const currentText = mainTextArea.innerHTML.split('');
                        currentText[index] = char;
                        mainTextArea.innerHTML = currentText.join('');
                        
                        // Add color to represent confidence
                        const confidence = (currentStep + 1) / totalSteps;
                        const hue = 120 * confidence; // 0 = red, 120 = green
                        mainTextArea.style.color = `hsl(${hue}, 80%, 40%)`;
                    }, index * charDelay);
                });
                
                // Update explanation text
                explanationText.textContent = stageDescriptions[currentStep];
                
                // Move to next step after delay
                // Adjust timing based on screen size
                currentStep++;
                if (currentStep < totalSteps) {
                    const stepDelay = isMobile ? 800 : 1000;
                    setTimeout(runDiffusionStep, characters.length * charDelay + stepDelay);
                }
            }
            
            // Start the diffusion process
            runDiffusionStep();
        }
    });
}

// Helper function to generate diffusion stages
function generateDiffusionStages(targetText, numberOfStages) {
    const stages = [];
    const chars = "!@#$%^&*()_+=-{}[]|\\:;\"'<>,.?/0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    // For each stage, generate progressively less noisy text
    for (let stage = 0; stage < numberOfStages; stage++) {
        const stageProbability = stage / (numberOfStages - 1); // 0 to 1
        let stageText = '';
        
        for (let i = 0; i < targetText.length; i++) {
            const targetChar = targetText[i];
            const useCorrectChar = Math.random() < stageProbability;
            
            if (useCorrectChar) {
                stageText += targetChar;
            } else {
                // Use random char or "nearby" char for more realistic noise
                if (targetChar === ' ') {
                    stageText += Math.random() < 0.7 ? ' ' : chars[Math.floor(Math.random() * chars.length)];
                } else {
                    // Use similar looking characters when possible
                    const charIndex = chars.indexOf(targetChar);
                    if (charIndex >= 0) {
                        // Use nearby characters in the chars string with higher probability
                        const variance = Math.floor(chars.length * (1 - stageProbability) / 3);
                        const newIndex = Math.max(0, Math.min(chars.length - 1, 
                            charIndex + Math.floor(Math.random() * variance * 2 - variance)));
                        stageText += chars[newIndex];
                    } else {
                        stageText += chars[Math.floor(Math.random() * chars.length)];
                    }
                }
            }
        }
        
        // Last stage is always the target text
        if (stage === numberOfStages - 1) {
            stages.push(targetText);
        } else {
            stages.push(stageText);
        }
    }
    
    return stages;
}

function startTransformerAnimation() {
    const container = document.getElementById('transformer-animation');
    container.innerHTML = '';

    // Add active class
    container.classList.add('active');
    
    // Check screen size and adjust UI elements
    const isMobile = window.innerWidth < 576;
    const isTablet = window.innerWidth >= 576 && window.innerWidth < 992;
    
    // Create a container for the animation elements
    const animationWrapper = document.createElement('div');
    animationWrapper.style.width = '100%';
    animationWrapper.style.height = '100%';
    animationWrapper.style.position = 'relative';
    container.appendChild(animationWrapper);
    
    // Create step counter display
    const stepCounter = document.createElement('div');
    stepCounter.style.position = 'absolute';
    stepCounter.style.top = '10px';
    stepCounter.style.right = '10px';
    stepCounter.style.padding = isMobile ? '3px 6px' : '5px 10px';
    stepCounter.style.background = 'rgba(0, 0, 0, 0.7)';
    stepCounter.style.color = 'white';
    stepCounter.style.borderRadius = '5px';
    stepCounter.style.fontSize = isMobile ? '12px' : '14px';
    stepCounter.style.zIndex = '10';
    stepCounter.textContent = 'Phase: Input Processing';
    animationWrapper.appendChild(stepCounter);
    
    // Create explanation text
    const explanationText = document.createElement('div');
    explanationText.style.position = 'absolute';
    explanationText.style.bottom = '10px';
    explanationText.style.left = '50%';
    explanationText.style.transform = 'translateX(-50%)';
    explanationText.style.textAlign = 'center';
    explanationText.style.width = '90%';
    explanationText.style.fontSize = isMobile ? '11px' : '14px';
    explanationText.style.color = '#666';
    explanationText.style.opacity = '0';
    explanationText.style.padding = isMobile ? '3px' : '5px 10px';
    explanationText.style.background = 'rgba(255, 255, 255, 0.9)';
    explanationText.style.borderRadius = '5px';
    explanationText.style.zIndex = '10';
    explanationText.style.overflow = 'hidden';
    explanationText.style.textOverflow = 'ellipsis';
    explanationText.style.maxHeight = isMobile ? '40px' : '60px';
    explanationText.style.display = '-webkit-box';
    explanationText.style.webkitLineClamp = '2';
    explanationText.style.webkitBoxOrient = 'vertical';
    animationWrapper.appendChild(explanationText);
    
    // Layers container - adjust height dynamically
    const layersContainer = document.createElement('div');
    layersContainer.style.position = 'absolute';
    layersContainer.style.top = '40px';
    layersContainer.style.left = '0';
    layersContainer.style.width = '100%';
    layersContainer.style.height = 'calc(100% - 80px)';
    animationWrapper.appendChild(layersContainer);
    
    // Create token visualization area
    const tokenLayer = document.createElement('div');
    tokenLayer.style.position = 'absolute';
    tokenLayer.style.top = '0';
    tokenLayer.style.left = '0';
    tokenLayer.style.width = '100%';
    tokenLayer.style.height = '25%';
    tokenLayer.style.display = 'flex';
    tokenLayer.style.justifyContent = 'center';
    tokenLayer.style.alignItems = 'center';
    tokenLayer.style.opacity = '0';
    tokenLayer.style.zIndex = '2';
    layersContainer.appendChild(tokenLayer);
    
    // Create self-attention visualization area
    const attentionLayer = document.createElement('div');
    attentionLayer.style.position = 'absolute';
    attentionLayer.style.top = '25%';
    attentionLayer.style.left = '0';
    attentionLayer.style.width = '100%';
    attentionLayer.style.height = '40%';
    attentionLayer.style.opacity = '0';
    attentionLayer.style.zIndex = '2';
    layersContainer.appendChild(attentionLayer);
    
    // Create output visualization area
    const outputLayer = document.createElement('div');
    outputLayer.style.position = 'absolute';
    outputLayer.style.top = '65%';
    outputLayer.style.left = '0';
    outputLayer.style.width = '100%';
    outputLayer.style.height = '35%';
    outputLayer.style.display = 'flex';
    outputLayer.style.justifyContent = 'center';
    outputLayer.style.alignItems = 'center';
    outputLayer.style.opacity = '0';
    outputLayer.style.zIndex = '2';
    layersContainer.appendChild(outputLayer);
    
    // Create connection lines canvas
    const canvas = document.createElement('canvas');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    const ctx = canvas.getContext('2d');
    animationWrapper.appendChild(canvas);
    
    // Define token data - adjust for screen size
    let tokens;
    if (isMobile) {
        tokens = ['I', 'love', 'ML'];
    } else if (isTablet) {
        tokens = ['I', 'love', 'ML', 'models'];
    } else {
        tokens = ['I', 'love', 'natural', 'language', 'processing'];
    }
    
    const outputSequence = [...tokens]; // Copy the tokens array
    const tokenElements = [];
    const attentionElements = [];
    const outputElements = [];
    
    // Animation sequence
    gsap.to(explanationText, {
        opacity: 1,
        duration: 0.5
    });
    
    explanationText.textContent = "Transformer models process all input tokens simultaneously";
    
    // Phase 1: Display input tokens
    setTimeout(() => {
        gsap.to(tokenLayer, {
            opacity: 1,
            duration: 0.5
        });
        
        // Create token elements with responsive sizing
        const tokenWidth = isMobile ? '28%' : (tokens.length > 4 ? '18%' : '22%');
        const tokenMargin = isMobile ? '1%' : '1%';
        const tokenHeight = isMobile ? '70%' : '80%';
        const tokenFontSize = isMobile ? '14px' : (isTablet ? '15px' : '16px');
        
        tokens.forEach((token, i) => {
            const tokenElement = document.createElement('div');
            tokenElement.className = 'transformer-token';
            tokenElement.style.width = tokenWidth;
            tokenElement.style.margin = `0 ${tokenMargin}`;
            tokenElement.style.height = tokenHeight;
            tokenElement.style.display = 'flex';
            tokenElement.style.justifyContent = 'center';
            tokenElement.style.alignItems = 'center';
            tokenElement.style.backgroundColor = '#007BFF';
            tokenElement.style.color = 'white';
            tokenElement.style.borderRadius = '5px';
            tokenElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            tokenElement.style.opacity = 0;
            tokenElement.style.fontWeight = 'bold';
            tokenElement.style.fontSize = tokenFontSize;
            tokenElement.style.overflow = 'hidden';
            tokenElement.style.whiteSpace = 'nowrap';
            tokenElement.style.textOverflow = 'ellipsis';
            tokenElement.textContent = token;
            tokenLayer.appendChild(tokenElement);
            tokenElements.push(tokenElement);
            
            gsap.to(tokenElement, {
                opacity: 1,
                delay: i * 0.2,
                duration: 0.3,
                y: -10,
                yoyo: true,
                repeat: 1
            });
        });
        
        // Phase 2: Show self-attention
        setTimeout(() => {
            stepCounter.textContent = 'Phase: Self-Attention';
            explanationText.textContent = "Self-attention allows each token to attend to all other tokens";
            
            gsap.to(attentionLayer, {
                opacity: 1,
                duration: 0.5
            });
            
            // Create attention heads - adjust count for mobile
            const headCount = isMobile ? 2 : (isTablet ? 3 : 4);
            const headContainer = document.createElement('div');
            headContainer.style.display = 'flex';
            headContainer.style.justifyContent = 'space-around';
            headContainer.style.alignItems = 'center';
            headContainer.style.width = '100%';
            headContainer.style.height = '100%';
            attentionLayer.appendChild(headContainer);
            
            // Responsive sizing for attention heads
            const headWidth = isMobile ? '35%' : `${90 / headCount}%`;
            const headHeight = isMobile ? '70%' : '80%';
            const headFontSize = isMobile ? '12px' : '14px';
            
            for (let h = 0; h < headCount; h++) {
                const attentionHead = document.createElement('div');
                attentionHead.className = 'attention-head';
                attentionHead.style.width = headWidth;
                attentionHead.style.height = headHeight;
                attentionHead.style.backgroundColor = `hsl(${210 + h * 30}, 80%, 65%)`;
                attentionHead.style.borderRadius = '50%';
                attentionHead.style.display = 'flex';
                attentionHead.style.justifyContent = 'center';
                attentionHead.style.alignItems = 'center';
                attentionHead.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
                attentionHead.style.color = 'white';
                attentionHead.style.fontWeight = 'bold';
                attentionHead.style.fontSize = headFontSize;
                attentionHead.style.opacity = 0;
                headContainer.appendChild(attentionHead);
                attentionElements.push(attentionHead);
                
                // Show head label only if there's enough space
                attentionHead.textContent = isMobile ? `H${h+1}` : `Head ${h+1}`;
                
                gsap.to(attentionHead, {
                    opacity: 1,
                    delay: h * 0.2,
                    duration: 0.5,
                    scale: 1.1,
                    yoyo: true,
                    repeat: 1
                });
            }
            
            // Draw attention connections - adjust timing for mobile
            const connectionDelay = isMobile ? 500 : 1000;
            setTimeout(() => {
                drawAttentionConnections(ctx, tokenElements, attentionElements);
                
                // Phase 3: Show parallel processing
                setTimeout(() => {
                    stepCounter.textContent = 'Phase: Parallel Processing';
                    explanationText.textContent = "Transformers process all tokens in parallel rather than sequentially";
                    
                    // Pulse all attention heads simultaneously
                    attentionElements.forEach(head => {
                        gsap.to(head, {
                            scale: 1.1,
                            duration: 0.3,
                            repeat: 2,
                            yoyo: true
                        });
                    });
                    
                    // Phase 4: Show output
                    setTimeout(() => {
                        stepCounter.textContent = 'Phase: Output Generation';
                        explanationText.textContent = "The model produces output tokens based on self-attention results";
                        
                        gsap.to(outputLayer, {
                            opacity: 1,
                            duration: 0.5
                        });
                        
                        // Create output token elements - responsive sizing
                        const outputWidth = isMobile ? '28%' : (outputSequence.length > 4 ? '18%' : '22%');
                        const outputMargin = isMobile ? '1%' : '1%';
                        const outputHeight = isMobile ? '60%' : '60%';
                        const outputFontSize = isMobile ? '14px' : (isTablet ? '15px' : '16px');
                        
                        outputSequence.forEach((token, i) => {
                            const outputElement = document.createElement('div');
                            outputElement.className = 'output-token';
                            outputElement.style.width = outputWidth;
                            outputElement.style.margin = `0 ${outputMargin}`;
                            outputElement.style.height = outputHeight;
                            outputElement.style.display = 'flex';
                            outputElement.style.justifyContent = 'center';
                            outputElement.style.alignItems = 'center';
                            outputElement.style.backgroundColor = '#28a745';
                            outputElement.style.color = 'white';
                            outputElement.style.borderRadius = '5px';
                            outputElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                            outputElement.style.opacity = 0;
                            outputElement.style.fontWeight = 'bold';
                            outputElement.style.fontSize = outputFontSize;
                            outputElement.style.overflow = 'hidden';
                            outputElement.style.whiteSpace = 'nowrap';
                            outputElement.style.textOverflow = 'ellipsis';
                            outputElement.textContent = token;
                            outputLayer.appendChild(outputElement);
                            outputElements.push(outputElement);
                            
                            gsap.to(outputElement, {
                                opacity: 1,
                                delay: i * 0.15,
                                duration: 0.3
                            });
                        });
                        
                        // Draw connections from attention to output - adjust timing for mobile
                        const outputConnectionDelay = isMobile ? 700 : 1000;
                        setTimeout(() => {
                            drawOutputConnections(ctx, attentionElements, outputElements);
                            
                            // Final phase - show autoregressive generation
                            setTimeout(() => {
                                stepCounter.textContent = 'Phase: Generation Complete';
                                explanationText.textContent = "Transformer has processed all tokens and generated the complete output";
                                
                                // Highlight all components together
                                gsap.to([...tokenElements, ...attentionElements, ...outputElements], {
                                    boxShadow: '0 0 15px rgba(0, 123, 255, 0.7)',
                                    duration: 0.5,
                                    repeat: 1,
                                    yoyo: true,
                                    onComplete: () => {
                                        // Remove active class after animation completes
                                        setTimeout(() => {
                                            container.classList.remove('active');
                                        }, 1000);
                                    }
                                });
                            }, isMobile ? 800 : 1500);
                        }, outputConnectionDelay);
                    }, isMobile ? 800 : 1500);
                }, isMobile ? 800 : 1500);
            }, connectionDelay);
        }, isMobile ? 800 : 1500);
    }, isMobile ? 300 : 500);
    
    // Helper function to draw attention connections
    function drawAttentionConnections(ctx, tokenElements, attentionElements) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Get positions of elements
        const tokenPositions = tokenElements.map(element => {
            const rect = element.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            return {
                x: rect.left - containerRect.left + rect.width / 2,
                y: rect.bottom - containerRect.top
            };
        });
        
        const attentionPositions = attentionElements.map(element => {
            const rect = element.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            return {
                x: rect.left - containerRect.left + rect.width / 2,
                y: rect.top - containerRect.top
            };
        });
        
        // Draw connections with different colors for different attention heads
        ctx.lineWidth = window.innerWidth < 576 ? 0.5 : 1;
        
        // Draw multiple connections in sequence
        let connectionCount = 0;
        const totalConnections = tokenPositions.length * attentionPositions.length;
        
        // Adjust connection speed based on screen size
        const connectionSpeed = window.innerWidth < 576 ? 10 : 20;
        
        const connectionInterval = setInterval(() => {
            if (connectionCount >= totalConnections) {
                clearInterval(connectionInterval);
                return;
            }
            
            const tokenIndex = connectionCount % tokenPositions.length;
            const attentionIndex = Math.floor(connectionCount / tokenPositions.length);
            
            const tokenPos = tokenPositions[tokenIndex];
            const attentionPos = attentionPositions[attentionIndex];
            
            const hue = 210 + attentionIndex * 30;
            ctx.strokeStyle = `hsla(${hue}, 80%, 65%, 0.6)`;
            
            // Draw curved line
            ctx.beginPath();
            ctx.moveTo(tokenPos.x, tokenPos.y);
            ctx.bezierCurveTo(
                tokenPos.x, tokenPos.y + (attentionPos.y - tokenPos.y) / 3,
                attentionPos.x, attentionPos.y - (attentionPos.y - tokenPos.y) / 3,
                attentionPos.x, attentionPos.y
            );
            ctx.stroke();
            
            connectionCount++;
        }, connectionSpeed);
    }
    
    // Helper function to draw output connections
    function drawOutputConnections(ctx, attentionElements, outputElements) {
        // Get positions of elements
        const attentionPositions = attentionElements.map(element => {
            const rect = element.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            return {
                x: rect.left - containerRect.left + rect.width / 2,
                y: rect.bottom - containerRect.top
            };
        });
        
        const outputPositions = outputElements.map(element => {
            const rect = element.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            return {
                x: rect.left - containerRect.left + rect.width / 2,
                y: rect.top - containerRect.top
            };
        });
        
        // Draw connections
        ctx.lineWidth = window.innerWidth < 576 ? 0.8 : 1.5;
        
        // Draw connections in sequence
        let connectionCount = 0;
        const totalConnections = outputPositions.length;
        
        // Adjust connection speed based on screen size
        const connectionSpeed = window.innerWidth < 576 ? 100 : 150;
        
        const connectionInterval = setInterval(() => {
            if (connectionCount >= totalConnections) {
                clearInterval(connectionInterval);
                return;
            }
            
            const outputPos = outputPositions[connectionCount];
            
            // Draw connections from all attention heads to this output token
            attentionPositions.forEach((attentionPos, index) => {
                const hue = 120 + index * 20; // Green-ish gradient
                ctx.strokeStyle = `hsla(${hue}, 70%, 50%, 0.5)`;
                
                ctx.beginPath();
                ctx.moveTo(attentionPos.x, attentionPos.y);
                ctx.bezierCurveTo(
                    attentionPos.x, attentionPos.y + (outputPos.y - attentionPos.y) / 3,
                    outputPos.x, outputPos.y - (outputPos.y - attentionPos.y) / 3,
                    outputPos.x, outputPos.y
                );
                ctx.stroke();
            });
            
            connectionCount++;
        }, connectionSpeed);
    }
}