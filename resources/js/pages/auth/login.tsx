import { Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import axios from 'axios';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status }: LoginProps) {
    const [legacyError, setLegacyError] = useState<string | null>(null);
    const [legacyProcessing, setLegacyProcessing] = useState(false);
    const [formData, setFormData] = useState<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        handleLegacyAuth();
    };

    const handleLegacyAuth = async () => {
        setLegacyProcessing(true);
        setLegacyError(null);

        try {
            const response = await axios.post(route('login.proesc'), {
                email: formData.email,
                password: formData.password,
                acesso_aplicativo: true,
                remember: formData.remember,
            });

            if (response.data.status === 'success') {
                // Redirect to dashboard
                window.location.href = route('dashboard');
            }
        } catch (error: any) {
            setLegacyError(error.response?.data?.message || 'Authentication failed');
        } finally {
            setLegacyProcessing(false);
        }
    };

    return (
        <AuthLayout title="Proesc Notes" description="Digite suas credenciais de suporte abaixo para logar">
            <Head title="Login suporte" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="support@example.com"
                        />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Senha</Label>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Senha"
                        />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={formData.remember}
                            onClick={() => setFormData({ ...formData, remember: !formData.remember })}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Lembrar de mim</Label>
                    </div>

                    <Button 
                        type="submit" 
                        className="mt-4 w-full" 
                        tabIndex={4} 
                        disabled={legacyProcessing}
                    >
                        {legacyProcessing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Logar com Proesc
                    </Button>
                </div>

                {/* Legacy Error Display */}
                {legacyError && (
                    <div className="text-center text-sm font-medium text-red-600">
                        {legacyError}
                    </div>
                )}

                <div className="text-center text-sm text-muted-foreground">
                    Acesso somente para suporte. Contate seu administrador para acesso.
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
