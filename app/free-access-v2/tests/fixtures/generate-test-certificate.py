"""TEST-ONLY: generate committed localhost TLS qualification fixtures.

The private key is public test material, never production configuration.
Tests use the committed PEM files; they do not require Python/cryptography.
"""
from datetime import datetime, timezone
from ipaddress import ip_address
from pathlib import Path
from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.x509.oid import NameOID

destination = Path(__file__).resolve().parent
key = ec.generate_private_key(ec.SECP256R1())
subject = x509.Name([
    x509.NameAttribute(NameOID.ORGANIZATION_NAME, "PSC TEST-ONLY SYNTHETIC QUALIFICATION"),
    x509.NameAttribute(NameOID.COMMON_NAME, "localhost"),
])
certificate = (
    x509.CertificateBuilder().subject_name(subject).issuer_name(subject)
    .public_key(key.public_key()).serial_number(x509.random_serial_number())
    .not_valid_before(datetime(2025, 1, 1, tzinfo=timezone.utc))
    .not_valid_after(datetime(2040, 1, 1, tzinfo=timezone.utc))
    .add_extension(x509.BasicConstraints(ca=True, path_length=0), critical=True)
    .add_extension(x509.SubjectAlternativeName([
        x509.DNSName("localhost"), x509.IPAddress(ip_address("127.0.0.1"))
    ]), critical=False).sign(key, hashes.SHA256())
)
(destination / "localhost-test-only.key.pem").write_bytes(key.private_bytes(
    serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8,
    serialization.NoEncryption(),
))
(destination / "localhost-test-only.cert.pem").write_bytes(certificate.public_bytes(serialization.Encoding.PEM))
