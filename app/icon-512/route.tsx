import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 320, // Scaled for 512px
                    background: '#a3e635', // lime-400
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'black',
                    border: '32px solid black', // Scaled border
                    borderRadius: '64px', // Scaled radius
                }}
            >
                <svg
                    width="320"
                    height="320"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
            </div>
        ),
        {
            width: 512,
            height: 512,
        }
    );
}
