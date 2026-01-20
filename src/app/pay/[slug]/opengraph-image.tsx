import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';
import { getPayLinkBySlug } from 'src/actions/paylink';

export const runtime = 'nodejs';
export const alt = 'CasPay Payment Link';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const paylink = await getPayLinkBySlug(slug);

    const product = (paylink as any)?.product;
    const merchant = (paylink as any)?.merchant;

    const price = product?.price ?? '0';
    const currency = product?.currency ?? 'CSPR';
    const productName = product?.name ?? 'Payment';
    const merchantName = merchant?.store_name ?? 'CasPay Merchant';
    const productImageUrl = product?.image_url;
    const productDescription = product?.description;
    const customMessage = (paylink as any)?.custom_message;

    const csprPath = path.join(process.cwd(), 'public/logo/cspr.png');
    const csprData = fs.readFileSync(csprPath).toString('base64');
    const csprSrc = `data:image/png;base64,${csprData}`;

    const truncate = (text: string, maxLen: number) =>
        text.length > maxLen ? `${text.slice(0, maxLen)}...` : text;

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0d0d25 100%)',
                    padding: '48px',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: '-100px',
                        right: '-100px',
                        width: '500px',
                        height: '500px',
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
                        borderRadius: '50%',
                        display: 'flex',
                    }}
                />

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '28px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span
                                style={{
                                    fontSize: '28px',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    letterSpacing: '-0.5px',
                                }}
                            >
                                CasPay
                            </span>
                            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                                Payment Link on Casper Network
                            </span>
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(255,255,255,0.1)',
                            padding: '12px 20px',
                            borderRadius: '50px',
                            border: '1px solid rgba(255,255,255,0.2)',
                        }}
                    >
                        <span style={{ fontSize: '16px', color: 'white', fontWeight: 500 }}>
                            Secured by Casper Network
                        </span>
                        <img
                            src={csprSrc}
                            alt="Casper Network"
                            width={24}
                            height={24}
                            style={{
                                objectFit: 'contain',
                            }}
                        />
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '650px' }}>
                        <div
                            style={{
                                fontSize: '65px',
                                fontWeight: 'bold',
                                color: 'white',
                                lineHeight: 1.1,
                            }}
                        >
                            {`Pay ${price} $${currency}`}
                        </div>
                        <div style={{ fontSize: '24px', color: 'rgba(255,255,255,0.7)' }}>
                            {`for "${productName}"`}
                        </div>

                        {productDescription && (
                            <div
                                style={{
                                    fontSize: '16px',
                                    color: 'rgba(255,255,255,0.5)',
                                    marginTop: '4px',
                                    lineHeight: 1.4,
                                }}
                            >
                                {truncate(productDescription, 80)}
                            </div>
                        )}

                        {customMessage && (
                            <div
                                style={{
                                    display: 'flex',
                                    marginTop: '8px',
                                    padding: '10px 14px',
                                    background: 'rgba(139, 92, 246, 0.15)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                }}
                            >
                                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>
                                    {`"${truncate(customMessage, 60)}"`}
                                </span>
                            </div>
                        )}

                        <div style={{ display: 'flex', marginTop: '8px' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '8px 14px',
                                    borderRadius: '50px',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                }}
                            >
                                <div
                                    style={{
                                        width: '8px',
                                        height: '8px',
                                        background: '#22c55e',
                                        borderRadius: '50%',
                                        display: 'flex',
                                    }}
                                />
                                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                    {`Merchant: ${merchantName}`}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', marginTop: '16px' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    background: '#22c55e',
                                    padding: '10px 24px',
                                    borderRadius: '6px',
                                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.25)',
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: '16px',
                                        color: 'white',
                                        fontWeight: 600,
                                        letterSpacing: '0.2px',
                                    }}
                                >
                                    Pay Now
                                </span>
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(255,255,255,0.05)',
                            padding: '20px',
                            borderRadius: '24px',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        {productImageUrl ? (
                            <img
                                src={productImageUrl}
                                alt={productName}
                                width={280}
                                height={280}
                                style={{
                                    borderRadius: '16px',
                                    objectFit: 'cover',
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: '280px',
                                    height: '280px',
                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '80px',
                                    color: 'white',
                                    fontWeight: 'bold',
                                }}
                            >
                                {productName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginTop: '12px',
                    }}
                >
                    <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)' }}>caspay.link</span>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
