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
        id: 'starter',
        name: 'Starter Pack',
        credits: 50,
        price: 49,
        description: 'Perfect for trying out UGC creation',
        popular: false,
        features: ['5 Generated Videos', 'Standard Processing', 'Email Support'],
    },
    {
        id: 'creator',
        name: 'Creator Pack',
        credits: 120,
        price: 99,
        description: 'Best value for regular creators',
        popular: true,
        features: ['12 Generated Videos', 'Priority Processing', 'HD Downloads', 'Priority Support'],
    },
    {
        id: 'agency',
        name: 'Agency Pack',
        credits: 300,
        price: 199,
        description: 'High volume for professional use',
        popular: false,
        features: ['30 Generated Videos', 'Instant Processing', '4K Downloads', 'Dedicated Manager'],
    },
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
            // In a real app, this would redirect to Stripe
            // For this demo, we'll simulate a successful purchase
            await new Promise(resolve => setTimeout(resolve, 1500));

            const { error } = await supabase.rpc('add_credits_v2', {
        p_amount: pkg.credits,
        p_description: `Purchased ${pkg.name}`
      });

            if (error) throw error;

            toast.success(`Successfully purchased ${pkg.credits} credits!`);
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Purchase failed:', error);
            toast.error('Purchase failed. Please try again.');
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
                        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            Choose the package that suits your creative needs.
                            <br />1 Video = 10 Credits.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {PRICING_PACKAGES.map((pkg) => (
                        <Card
                            key={pkg.id}
                            className={`relative flex flex-col ${pkg.popular
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
                                    <span className="text-4xl font-bold">${pkg.price}</span>
                                    <span className="text-gray-500">/one-time</span>
                                </div>
                                <div className="mt-2 text-purple-600 font-medium">
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
                                    className={`w-full ${pkg.popular ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                                    size="lg"
                                    onClick={() => handlePurchase(pkg)}
                                    disabled={!!loading}
                                >
                                    {loading === pkg.id ? 'Processing...' : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Buy {pkg.credits} Credits
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
