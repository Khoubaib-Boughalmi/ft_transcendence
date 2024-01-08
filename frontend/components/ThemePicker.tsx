import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

const themes = [{ name: 'Red' }, { name: 'Green' }, { name: 'Blue' }, { name: 'Purple' }, { name: 'Pink' }, { name: 'Yellow' }];

const ThemeChanger = () => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return (
        <div className="flex justify-between items-center">
            <div>
                <select
                    name="theme"
                    id="theme-select"
                    className="bg-card-300"
                    onChange={(e) => setTheme(e.currentTarget.value)}
                    value={theme}
                >
                    <option value="">Select Theme</option>
                    {themes.map((t) => (
                        <option key={t.name.toLowerCase()} value={t.name.toLowerCase()}>
                            {t.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default ThemeChanger;
