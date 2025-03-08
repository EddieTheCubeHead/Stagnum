from faker.providers import BaseProvider
from faker.providers.address import Provider as AddressProvider
from faker.providers.automotive import Provider as AutomotiveProvider
from faker.providers.bank import Provider as BankProvider
from faker.providers.barcode import Provider as BarcodeProvider
from faker.providers.color import Provider as ColorProvider
from faker.providers.company import Provider as CompanyProvider
from faker.providers.credit_card import Provider as CreditCardProvider
from faker.providers.currency import Provider as CurrencyProvider
from faker.providers.date_time import Provider as DateTimeProvider
from faker.providers.emoji import Provider as EmojiProvider
from faker.providers.file import Provider as FileProvider
from faker.providers.geo import Provider as GeoProvider
from faker.providers.internet import Provider as InternetProvider
from faker.providers.isbn import Provider as ISBNProvider
from faker.providers.job import Provider as JobProvider
from faker.providers.lorem import Provider as LoremProvider
from faker.providers.misc import Provider as MiscProvider
from faker.providers.passport import Provider as PassportProvider
from faker.providers.person import Provider as PersonProvider
from faker.providers.phone_number import Provider as PhoneNumberProvider
from faker.providers.profile import Provider as ProfileProvider
from faker.providers.python import Provider as PythonProvider
from faker.providers.sbn import Provider as SBNProvider
from faker.providers.ssn import Provider as SSNProvider
from faker.providers.user_agent import Provider as UserAgentProvider

type FakerFixture = (
    BaseProvider
    | AddressProvider
    | AutomotiveProvider
    | BankProvider
    | BarcodeProvider
    | ColorProvider
    | CompanyProvider
    | CreditCardProvider
    | CurrencyProvider
    | DateTimeProvider
    | EmojiProvider
    | FileProvider
    | GeoProvider
    | InternetProvider
    | ISBNProvider
    | JobProvider
    | LoremProvider
    | MiscProvider
    | PassportProvider
    | PersonProvider
    | PhoneNumberProvider
    | ProfileProvider
    | PythonProvider
    | SBNProvider
    | SSNProvider
    | UserAgentProvider
)
