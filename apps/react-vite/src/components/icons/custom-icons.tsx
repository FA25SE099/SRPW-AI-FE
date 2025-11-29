import { SVGProps } from 'react';

/**
 * Custom Rice Plant Icon
 * Represents rice cultivation and varieties
 */
export const RicePlantIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {/* Main stem */}
            <path d="M12 22V2" />
            {/* Left rice grains */}
            <path d="M8 6c-1.5 1.5-1.5 4 0 6" />
            <path d="M7 8c-1 1-1 2.5 0 4" />
            {/* Right rice grains */}
            <path d="M16 6c1.5 1.5 1.5 4 0 6" />
            <path d="M17 8c1 1 1 2.5 0 4" />
            {/* Top grain */}
            <circle cx="12" cy="4" r="1.5" />
            {/* Bottom grains */}
            <path d="M9 14c-1 1-1 2 0 3" />
            <path d="M15 14c1 1 1 2 0 3" />
        </svg>
    );
};

/**
 * Custom Agronomy/Expert Icon
 * Represents agricultural expertise and analysis
 */
export const AgronomyIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {/* Microscope base */}
            <path d="M6 18h12" />
            <path d="M3 22h18" />
            {/* Microscope body */}
            <path d="M14 22a7 7 0 1 0 0-14h-1" />
            <path d="M9 8h2" />
            <path d="M9 12h4" />
            {/* Plant element */}
            <path d="M9 5V3" />
            <circle cx="9" cy="2" r="1" />
        </svg>
    );
};

/**
 * Custom Farm Field Icon
 * Represents agricultural plots and fields
 */
export const FarmFieldIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {/* Field boundaries */}
            <rect x="2" y="6" width="20" height="14" rx="2" />
            {/* Field rows */}
            <path d="M2 10h20" />
            <path d="M2 14h20" />
            <path d="M2 18h20" />
            {/* Vertical divisions */}
            <path d="M8 6v14" />
            <path d="M16 6v14" />
        </svg>
    );
};

/**
 * Custom Fertilizer Icon
 * Represents agricultural materials and fertilizers
 */
export const FertilizerIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {/* Bag */}
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <path d="M6 6h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
            {/* Content indicator */}
            <path d="M8 12h8" />
            <path d="M10 16h4" />
        </svg>
    );
};

/**
 * Custom Crop Monitoring Icon
 * Represents monitoring and surveillance of crops
 */
export const CropMonitoringIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {/* Plant */}
            <path d="M12 22v-8" />
            <path d="M8 14c-1.5-1.5-1.5-4 0-6" />
            <path d="M16 14c1.5-1.5 1.5-4 0-6" />
            {/* Magnifying glass */}
            <circle cx="16" cy="6" r="3" />
            <path d="M18.5 8.5l2 2" />
        </svg>
    );
};

/**
 * Custom Weather Alert Icon
 * Represents weather conditions and alerts
 */
export const WeatherAlertIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {/* Cloud */}
            <path d="M17.5 19H6a4 4 0 1 1-.29-7.99A6 6 0 1 1 18 11.5a3.5 3.5 0 0 1-.5 6.95z" />
            {/* Alert symbol */}
            <path d="M12 12v2" />
            <circle cx="12" cy="16" r="0.5" />
        </svg>
    );
};

/**
 * Custom Harvest Icon
 * Represents harvesting and crop collection
 */
export const HarvestIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {/* Sickle handle */}
            <path d="M3 21l4-4" />
            {/* Sickle blade */}
            <path d="M7 17a5 5 0 0 1 5-5 5 5 0 0 1 5 5" />
            {/* Wheat bundle */}
            <path d="M15 8V5" />
            <path d="M17 8V6" />
            <path d="M19 8V7" />
            <circle cx="15" cy="4" r="1" />
            <circle cx="17" cy="5" r="1" />
            <circle cx="19" cy="6" r="1" />
        </svg>
    );
};

/**
 * Custom Pest Control Icon
 * Represents pest management and control
 */
export const PestControlIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {/* Bug body */}
            <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" />
            {/* Bug legs */}
            <path d="M6 10L4 8" />
            <path d="M6 14L4 16" />
            <path d="M18 10l2-2" />
            <path d="M18 14l2 2" />
            {/* Bug antennae */}
            <path d="M10 8L9 6" />
            <path d="M14 8l1-2" />
            {/* X mark (control) */}
            <path d="M10 12l4 4" />
            <path d="M14 12l-4 4" />
        </svg>
    );
};

