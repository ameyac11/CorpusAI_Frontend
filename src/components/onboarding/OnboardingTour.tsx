import { useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useTheme } from 'next-themes';

const driverConfig = {
    showProgress: true,
    animate: true,
    allowClose: true,
    showButtons: ['next', 'previous', 'close'] as ('next' | 'previous' | 'close')[],
    nextBtnText: 'Next',
    prevBtnText: 'Back',
    doneBtnText: 'Finish',
};

export function OnboardingTour() {
    const driverObj = useRef<ReturnType<typeof driver> | null>(null);
    const { theme } = useTheme();

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('onboarding_completed_v6');

        if (!hasSeenTour) {
            const isDark = theme === 'dark';
            const popoverClass = isDark ? 'driver-popover-dark' : 'driver-popover-light';

            // Configuration for the tour steps
            driverObj.current = driver({
                ...driverConfig,
                steps: [
                    {
                        element: 'body', // Center popover
                        popover: {
                            title: 'Welcome to CorpusAI',
                            description: 'Let\'s take a quick tour to help you get started.',
                            align: 'center',
                            popoverClass,
                            showButtons: ['next', 'close']
                        }
                    },
                    {
                        element: '#tour-chat-input',
                        popover: {
                            title: 'Ask Questions',
                            description: 'Type your queries here. You can ask about documents, concepts, or general topics.',
                            side: 'top',
                            align: 'center',
                            popoverClass,
                            showButtons: ['next', 'previous', 'close']
                        }
                    },
                    {
                        element: '#tour-mode-selector',
                        popover: {
                            title: 'Select Mode',
                            description: 'Switch between AI Only, Documents Only, or Hybrid mode for targeted responses.',
                            side: 'bottom',
                            align: 'center',
                            popoverClass,
                            showButtons: ['next', 'previous', 'close']
                        }
                    },
                    {
                        element: '#tour-documents-trigger',
                        popover: {
                            title: 'Manage Resources',
                            description: 'Upload PDFs, images, or add web links to power your AI responses.',
                            side: 'bottom',
                            align: 'start',
                            popoverClass,
                            showButtons: ['next', 'previous', 'close']
                        }
                    },
                    {
                        element: '#tour-nav-resources',
                        popover: {
                            title: 'Resources Library',
                            description: 'View and manage all your uploaded documents and web links in one place.',
                            side: 'right',
                            align: 'center',
                            popoverClass,
                            showButtons: ['next', 'previous', 'close']
                        }
                    },
                    {
                        element: '#tour-new-chat',
                        popover: {
                            title: 'New Conversation',
                            description: 'Start a fresh chat anytime. Your history is saved automatically.',
                            side: 'right',
                            align: 'center',
                            popoverClass,
                            showButtons: ['next', 'previous', 'close']
                        }
                    },
                    {
                        element: '#tour-creative-space',
                        popover: {
                            title: 'Creative Space',
                            description: 'Access tools for generating specific content types and visualizations.',
                            side: 'right',
                            align: 'center',
                            popoverClass,
                            showButtons: ['previous', 'close'],
                            doneBtnText: 'Finish'
                        }
                    }
                ],
                onDestroyStarted: () => {
                    driverObj.current?.destroy();
                    localStorage.setItem('onboarding_completed_v6', 'true');
                },
                onPopoverRender: (popover) => {
                    // Custom styling injection for popover
                    popover.wrapper.style.borderRadius = '12px';

                    // Inject global styles to override driver.js defaults
                    if (!document.getElementById('driver-dark-mode-override')) {
                        const styleTag = document.createElement('style');
                        styleTag.id = 'driver-dark-mode-override';
                        styleTag.innerHTML = `
                            /* Rename close button to Skip */
                            .driver-popover-close-btn {
                                font-size: 0 !important;
                            }
                            .driver-popover-close-btn::before {
                                content: 'Skip' !important;
                                font-size: 14px !important;
                            }
                            
                            .dark .driver-popover {
                                background-color: #18181b !important;
                                color: #fafafa !important;
                                border: 1px solid #27272a !important;
                            }
                            .dark .driver-popover-title {
                                color: #fafafa !important;
                            }
                            .dark .driver-popover-description {
                                color: #a1a1aa !important;
                            }
                            .dark .driver-popover-footer button {
                                background-color: #27272a !important;
                                color: #fafafa !important;
                                border: 1px solid #3f3f46 !important;
                            }
                            .dark .driver-popover-footer button:hover {
                                background-color: #3f3f46 !important;
                            }
                            .dark .driver-popover-close-btn {
                                color: #a1a1aa !important;
                            }
                        `;
                        document.head.appendChild(styleTag);
                    }

                    if (isDark) {
                        popover.wrapper.style.setProperty('background-color', '#18181b', 'important');
                        popover.wrapper.style.setProperty('color', '#fafafa', 'important');
                        popover.title.style.setProperty('color', '#fafafa', 'important');
                        popover.description.style.setProperty('color', '#a1a1aa', 'important');
                        popover.wrapper.style.setProperty('border', '1px solid #27272a', 'important');
                    } else {
                        popover.wrapper.style.backgroundColor = '#ffffff';
                        popover.wrapper.style.color = '#09090b';
                        popover.title.style.color = '#09090b';
                        popover.description.style.color = '#71717a';
                    }
                }
            });

            // Start the tour
            driverObj.current.drive();
        }
    }, [theme]);

    return null; // This component doesn't render anything visible itself
}
