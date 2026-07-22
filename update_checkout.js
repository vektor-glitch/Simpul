const fs = require('fs');
let content = fs.readFileSync('src/components/marketplace/CheckoutClient.tsx', 'utf8');

content = content.replace('const [buyer, setBuyer] = useState<any>(null);', 
    'const [buyer, setBuyer] = useState<any>(null);\n    const [addresses, setAddresses] = useState<any[]>([]);\n    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);');

content = content.replace(`const { data: profile } = await supabase
                .from('buyer_profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();`, 
`const { data: profile } = await supabase
                .from('buyer_profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            const { data: userAddrs } = await supabase.from('addresses').select('*').eq('user_id', session.user.id).order('is_primary', {ascending: false});
            if (userAddrs && userAddrs.length > 0) {
                setAddresses(userAddrs);
                setSelectedAddressId(userAddrs[0].id);
            }`);

content = content.replace(
    `shipping_address: buyer?.default_address + ', ' + buyer?.city + ' - ' + buyer?.postal_code,`,
    `shipping_address: addresses.length > 0 && selectedAddressId ? \`\${addresses.find(a => a.id === selectedAddressId)?.full_address}, \${addresses.find(a => a.id === selectedAddressId)?.city} - \${addresses.find(a => a.id === selectedAddressId)?.postal_code}\` : (buyer?.default_address + ', ' + buyer?.city + ' - ' + buyer?.postal_code),`
);

content = content.replace(
    `{buyer?.default_address ? (
                        <div className="bg-brand-50/50 p-4 rounded-xl border border-brand-100">
                            <p className="font-bold text-gray-900 mb-1">{buyer.name} <span className="text-gray-500 font-normal text-sm ml-2">({buyer.phone || "No HP belum diisi"})</span></p>
                            <p className="text-gray-600 text-sm">{buyer.default_address}</p>
                            <p className="text-gray-600 text-sm">{buyer.city} - {buyer.postal_code}</p>
                        </div>
                    ) : (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                            Anda belum melengkapi alamat pengiriman di profil Anda.
                        </div>
                    )}`,
    `{addresses.length > 0 ? (
                        <div className="space-y-3">
                            {addresses.map((addr) => (
                                <label key={addr.id} className={\`block p-4 rounded-xl border cursor-pointer transition-all \${selectedAddressId === addr.id ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-gray-200 hover:border-brand-300'}\`}>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                            <input type="radio" name="address" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-gray-300" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-900">{addr.recipient_name}</span>
                                                <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{addr.label}</span>
                                                {addr.is_primary && <span className="text-xs font-bold px-2 py-0.5 bg-brand-100 text-brand-600 rounded">Utama</span>}
                                            </div>
                                            <p className="text-gray-600 text-sm">{addr.phone}</p>
                                            <p className="text-gray-600 text-sm mt-1">{addr.full_address}</p>
                                            <p className="text-gray-600 text-sm">{addr.city}, {addr.postal_code}</p>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    ) : (
                        buyer?.default_address ? (
                            <div className="bg-brand-50/50 p-4 rounded-xl border border-brand-100">
                                <p className="font-bold text-gray-900 mb-1">{buyer.name} <span className="text-gray-500 font-normal text-sm ml-2">({buyer.phone || "No HP belum diisi"})</span></p>
                                <p className="text-gray-600 text-sm">{buyer.default_address}</p>
                                <p className="text-gray-600 text-sm">{buyer.city} - {buyer.postal_code}</p>
                            </div>
                        ) : (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                                Anda belum melengkapi alamat pengiriman di profil Anda.
                            </div>
                        )
                    )}`
);

content = content.replace(
    `disabled={isProcessing || isCalculatingShipping || !buyer?.default_address}`,
    `disabled={isProcessing || isCalculatingShipping || (!buyer?.default_address && addresses.length === 0)}`
);

content = content.replace(
    `{!buyer?.default_address && (`,
    `{(!buyer?.default_address && addresses.length === 0) && (`
);

fs.writeFileSync('src/components/marketplace/CheckoutClient.tsx', content);
console.log('CheckoutClient updated successfully.');
