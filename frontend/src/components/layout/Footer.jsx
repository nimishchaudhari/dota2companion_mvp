// frontend/src/components/layout/Footer.jsx
const Footer = () => {
    return (
        <footer className="bg-slate-800 border-t border-slate-700 mt-auto py-6 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Copyright */}
                    <p className="text-slate-400 text-sm text-center">
                        &copy; {new Date().getFullYear()} Dota 2 Companion
                    </p>

                    {/* Dota 2 Branding */}
                    <div className="flex items-center space-x-2">
                        <span className="text-slate-500 text-xs text-center">
                            Powered by
                        </span>
                        <span className="text-teal-400 text-xs font-semibold" style={{textShadow: "0 0 8px rgba(39, 174, 158, 0.3)"}}>
                            OpenDota API
                        </span>
                        <span className="text-slate-500 text-xs">
                            •
                        </span>
                        <span className="text-purple-400 text-xs font-semibold" style={{textShadow: "0 0 8px rgba(72, 48, 140, 0.3)"}}>
                            Steam API
                        </span>
                    </div>

                    {/* Additional Info */}
                    <p className="text-slate-500 text-xs text-center">
                        Not affiliated with Valve Corporation
                    </p>
                </div>

                <div className="mt-4 h-px bg-slate-700 opacity-60" />

                <p className="text-slate-500 text-xs text-center mt-3 italic">
                    "The battle begins..."
                </p>
            </div>
        </footer>
    );
};
export default Footer;
