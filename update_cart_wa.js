const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/cart/CartClient.tsx', 'utf8');

content = content.replace(
`<h3 className="font-bold text-gray-900 flex items-center gap-2">{storeName}</h3>`,
`<h3 className="font-bold text-gray-900 flex items-center gap-2">
                                {storeName}
                                {order.product?.users?.phone && (
                                    <a 
                                        href={\`https://wa.me/\${order.product.users.phone.replace(/^0/, '62')}\`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-green-500 hover:text-green-600 transition-colors ml-2"
                                        title="Chat WA"
                                    >
                                        <MessageSquare size={16} />
                                    </a>
                                )}
                            </h3>`
);

content = content.replace(
`<h3 className="font-bold text-gray-900 flex items-center gap-2">{storeName}</h3>`,
`<h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                {storeName}
                                                {item.product?.users?.phone && (
                                                    <a 
                                                        href={\`https://wa.me/\${item.product.users.phone.replace(/^0/, '62')}\`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-green-500 hover:text-green-600 transition-colors ml-2"
                                                        title="Chat WA"
                                                    >
                                                        <MessageSquare size={16} />
                                                    </a>
                                                )}
                                            </h3>`
);

fs.writeFileSync('src/app/(public)/cart/CartClient.tsx', content);
console.log('CartClient updated with WA links');
