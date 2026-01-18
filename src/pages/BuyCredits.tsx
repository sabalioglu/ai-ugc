import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const PRICING_PACKAGES = [
    {
        id: 'price_1SqtjlEmd2R9npIsm1yk6rOG',
        name: 'Starter Pack',
        credits: 500,
        price: 49,
        description: 'Perfect for trying out UGC creation',
        popular: false,
        features: ['~10 Generated Videos', 'Standard Processing', 'Email Support'],
    },
    {
        id: 'price_1SqtjmEmd2R9npIsYnbtXe6o',
        name: 'Creator Pack',
        credits: 1200,
        price: 99,
        description: 'Best value for regular creators',
        popular: true,
        features: ['~24 Generated Videos', 'Priority Processing', 'HD Downloads', 'Priority Support'],
    },
    {
        id: 'price_1SqtjmEmd2R9npIsWHwpZwC6',
        name: 'Agency Pack',
        credits: 3000,
        price: 199,
        description: 'High volume for professional use',
        popular: false,
        features: ['~60 Generated Videos', 'Instant Processing', '4K Downloads', 'Dedicated Manager'],
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        credits: 'Custom',
        price: 'Contact',
        description: 'For large scale organizations',
        popular: false,
        features: ['Unlimited Scale', 'API Access', 'Custom AI Models', 'SLA Support'],
        isContact: true
    }
];

export function BuyCredits() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState<string | null>(null);

    const handlePurchase = async (pkg: typeof PRICING_PACKAGES[0]) => {
        if (!user) {
            navigate('/auth');
            return;
        }

        setLoading(pkg.id);

        try {
            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                body: {
                    priceId: pkg.id,
                    userId: user.id
                },
            });

            if (error) throw error;

            if (data?.url) {
                // Breaking out of iframes (Bolt/Stackblitz)
                if (window.top) {
                    window.top.location.href = data.url;
                } else {
                    window.location.href = data.url;
                }
            } else {
                throw new Error(data?.error || 'Could not create checkout session');
            }
        } catch (error: any) {
            console.error('Purchase failed:', error);
            toast.error(`Payment failed: ${error.message || 'Check your internet connection'}`);
        } finally {
            setLoading(null);
        }
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <button onClick={() => navigate('/dashboard')} className="hover:text-purple-600">
                            Dashboard
                        </button>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <span>Buy Credits</span>
                    </div>
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h1 className="text-4xl font-bold mb-4 font-outfit text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">Simple, Transparent Pricing</h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            Choose the package that suits your creative needs.
                            <br />1 Video (12s-16s) = 50 Credits.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {PRICING_PACKAGES.map((pkg) => (
                        <Card
                            key={pkg.id}
                            className={`relative flex flex-col transition-all hover:shadow-2xl ${pkg.popular
                                ? 'border-2 border-purple-500 shadow-xl scale-105 z-10'
                                : 'border border-gray-200 dark:border-gray-800'
                                }`}
                        >
                            {pkg.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1">
                                        Most Popular
                                    </Badge>
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                                <CardDescription>{pkg.description}</CardDescription>
                                <div className="mt-4 flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">
                                        {typeof pkg.price === 'number' ? `$${pkg.price}` : pkg.price}
                                    </span>
                                    {typeof pkg.price === 'number' && <span className="text-gray-500">/one-time</span>}
                                </div>
                                <div className="mt-2 text-purple-600 font-bold text-lg">
                                    {pkg.credits} Credits
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <ul className="space-y-3">
                                    {pkg.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <Check className="w-4 h-4 text-green-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className={`w-full ${pkg.popular ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : ''}`}
                                    size="lg"
                                    onClick={() => {
                                        if (pkg.isContact) {
                                            window.location.href = 'mailto:sales@aiugc.com';
                                        } else {
                                            handlePurchase(pkg);
                                        }
                                    }}
                                    disabled={!!loading && !pkg.isContact}
                                    variant={pkg.isContact ? "outline" : "default"}
                                >
                                    {loading === pkg.id ? 'Connecting to Stripe...' : (
                                        <>
                                            {pkg.isContact ? (
                                                'Contact Sales'
                                            ) : (
                                                <>
                                                    <Sparkles className="w-4 h-4 mr-2" />
                                                    Buy {pkg.credits} Credits
                                                </>
                                            )}
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
