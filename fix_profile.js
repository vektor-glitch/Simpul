const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/buyer/profile/page.tsx', 'utf8');

// Tambah import
content = content.replace('import Image from "next/image";', 'import Image from "next/image";\nimport AddressBook from "@/components/dashboard/AddressBook";');

// Cari dan Hapus Kanan: Alamat
const startIndex = content.indexOf('{/* Kanan: Alamat */}');
const endIndex = content.indexOf('</div>\n\n                          {/* Tombol Simpan */}');

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = content.substring(0, startIndex) + '{/* Kanan: AddressBook */}\n                            <div className="space-y-7">\n                                <AddressBook />\n                            </div>\n                        ' + content.substring(endIndex);
  fs.writeFileSync('src/app/dashboard/buyer/profile/page.tsx', newContent);
  console.log('Replaced Alamat Pengiriman with AddressBook');
} else {
  console.log('Could not find boundaries', startIndex, endIndex);
}
