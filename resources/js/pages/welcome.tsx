import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome" />
            <section className='flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900'>
                <article className='mb-8 max-w-lg text-left'>
                    <AppLogoIcon className='w-42 h-42 mb-4 mx-auto' />
                    <h1
                        className='text-3xl font-bold text-gray-900 dark:text-white mb-4' 
                    >
                        
                        Bem vindo ao Proesc Notes!</h1>
                    <p
                        className='text-gray-700 dark:text-gray-300 mb-6'
                    >
                        Aqui você pode criar, editar e compartilhar <span className='font-semibold'>anotações</span> de forma fácil e rápida!
                        Você pode deixar anotações públicas, privadas ou somente para os colaboradores da Proesc :)
                    </p>

                    <p className='text-gray-700 dark:text-gray-300 mb-6 text-sm bg-gray-200 dark:bg-gray-800 p-4 rounded'>
                        Essa aplicação funciona de forma offline.
                    </p>

                    <Button
                    onClick={() => router.visit('/login')}
                    >
                        Login com Proesc 
                    </Button>
                </article>
            </section>
        </>
    );
}
