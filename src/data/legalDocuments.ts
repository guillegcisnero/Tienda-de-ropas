/**
 * DOCUMENTOS LEGALES OFICIALES DE ESVEN
 * Régimen de Contratación Electrónica, Términos y Condiciones,
 * Políticas de Privacidad y Políticas de Devolución, Cambio y Garantía.
 * 
 * Normativa aplicable:
 * - Ley 24.240 de Defensa del Consumidor
 * - Código Civil y Comercial de la Nación (CCCN)
 * - Resolución 424/2020 Secretaría de Comercio Interior (Botón de Arrepentimiento)
 * - Ley 25.326 de Protección de los Datos Personales (AAIP)
 * - Ley 22.362 de Marcas y Designaciones
 */

export interface LegalSection {
  id: string;
  title: string;
  content: string;
}

export const LEGAL_CONFIG = {
  storeName: 'ESVEN',
  parentCompany: 'Icariel System',
  legalEntity: 'Guillermo Cisnero (Titular de Icariel System & ESVEN)',
  cuit: '[XX-XXXXXXXX-X]', // A completar con el CUIT real del titular
  cuitStatusText: 'Responsable Monotributista — ARCA',
  legalAddress: 'Provincia de Buenos Aires, República Argentina',
  contactEmail: 'legales@esven.com.ar',
  parentLegalEmail: 'legales@icarielsystem.com.ar',
  contactPhone: '+54 9 11 3037-8139',
  jurisdiction: 'Tribunales Ordinarios en lo Comercial de la Capital Federal y Provincia de Buenos Aires (y fueros de consumo aplicables)',
  lastUpdated: 'Noviembre 2026'
};

export const TERMS_AND_CONDITIONS: LegalSection[] = [
  {
    id: 'introduccion',
    title: '1. Ámbito de Aplicación y Aceptación',
    content: `El presente contrato regula los términos y condiciones generales aplicables al uso de la plataforma y compras concretadas en ${LEGAL_CONFIG.storeName} (marca comercial y unidad de e-commerce de moda circular perteneciente al ecosistema ${LEGAL_CONFIG.parentCompany}, operada legalmente por ${LEGAL_CONFIG.legalEntity}, CUIT ${LEGAL_CONFIG.cuit}, con domicilio en ${LEGAL_CONFIG.legalAddress}), a través de su sitio web oficial.

Toda persona que acceda, navegue o complete una transacción comercial en la plataforma acepta de manera plena, expresa y sin reservas los presentes Términos y Condiciones, así como la Política de Privacidad y el Régimen de Devoluciones y Garantías. Quien no acepte estos términos de adhesión obligatorios deberá abstenerse de utilizar el sitio web.`
  },
  {
    id: 'naturaleza-piezas',
    title: '2. Naturaleza de los Productos: Piezas Únicas 1/1 y Moda Circular',
    content: `El usuario declara conocer y aceptar expresamente que ${LEGAL_CONFIG.storeName} se especializa en la curaduría y comercialización de indumentaria circular, prendas vintage y de segunda mano clasificadas como piezas únicas (1/1).

En virtud de dicha naturaleza intrínseca:
a) No existe duplicidad de inventario, réplicas ni stock de reposición en diferentes talles para un mismo producto.
b) Cada prenda se encuentra minuciosamente documentada con medidas precisas en centímetros (ancho de hombros, sisa/pecho, largo total y mangas) y con una calificación honesta de su estado de conservación (ej. 9/10, 8/10).
c) Las pequeñas variaciones estéticas, pátina o desgastes propios del uso vintage debidamente informados o fotografiados en la publicación no se considerarán vicios ni defectos del producto.`
  },
  {
    id: 'ordenes-concurrentes',
    title: '3. Procesamiento de Órdenes y Compras Concurrentes',
    content: `Tratándose de prendas de inventario unitario (1/1), en el eventual supuesto de que dos usuarios inicien o completen el proceso de compra de manera simultánea antes de que el catálogo actualice el estado a "vendido" o "reservado", la prioridad será asignada de forma estricta al pedido cuyo registro de cobro o confirmación se haya asentado primero en el sistema.

Para la orden concurrente que no pueda ser abastecida por falta de stock físico, ${LEGAL_CONFIG.storeName} procederá a la cancelación inmediata de la operación y al reintegro del 100% de los fondos abonados por el mismo medio de pago, sin que ello genere derecho a indemnización ni recargo alguno a favor del comprador.`
  },
  {
    id: 'precios-facturacion',
    title: '4. Precios, Errores Manifiestos y Facturación',
    content: `Todos los precios están expresados en Pesos Argentinos (ARS) e incluyen los tributos aplicables al consumidor final.

En supuestos excepcionales donde un producto exhiba un precio manifiestamente irrisorio o erróneo derivado de una falla técnica, bug de base de datos o error tipográfico evidente (verbigracia: una prenda con valor de mercado listada por error involuntario a $0 o $1), ${LEGAL_CONFIG.storeName} se reserva el derecho de cancelar la transacción por ausencia de causa y vicio en la oferta, notificando de inmediato al comprador y reintegrando la totalidad de los fondos percibidos sin penalidad.`
  },
  {
    id: 'envios-riesgo',
    title: '5. Logística, Plazos de Entrega y Transferencia del Riesgo',
    content: `Los envíos se despachan a través de empresas de transporte y correos habilitados (Correo Argentino, Andreani o servicios de mensajería urbana autorizados).

El plazo de entrega informado es de carácter estimado y se computa en días hábiles tras la acreditación efectiva del pago. ${LEGAL_CONFIG.storeName} responde ante el comprador por la pérdida o extravío del paquete imputable a la empresa de logística durante el tránsito, comprometiéndose a gestionar el reclamo y reintegrar la totalidad de lo pagado en caso de pérdida definitiva fehacientemente declarada por el transportista.`
  },
  {
    id: 'propiedad-intelectual',
    title: '6. Propiedad Intelectual y Enlaces',
    content: `Los contenidos del sitio web, incluyendo logotipos, isotipos, arquitectura de software, diseños, código fuente, compilaciones y estética editorial son de propiedad exclusiva de ${LEGAL_CONFIG.storeName}, ${LEGAL_CONFIG.parentCompany} y su titular legal ${LEGAL_CONFIG.legalEntity}, encontrándose protegidos por las leyes de propiedad intelectual y marcas de la República Argentina (Ley 11.723 y Ley 22.362) y tratados internacionales.`
  },
  {
    id: 'jurisdiccion',
    title: '7. Jurisdicción y Ley Aplicable',
    content: `Este contrato se rige íntegramente por las leyes de la República Argentina. Cualquier controversia derivada del presente será sometida prioritariamente a los mecanismos de conciliación previa en el marco del Sistema de Resolución de Conflictos en las Relaciones de Consumo (COPREC) o ante los tribunales ordinarios competentes en materia de consumo con jurisdicción en el domicilio del consumidor.`
  }
];

export const PRIVACY_POLICY: LegalSection[] = [
  {
    id: 'responsable-datos',
    title: '1. Responsable del Tratamiento y Marco Legal',
    content: `${LEGAL_CONFIG.storeName}, con domicilio en ${LEGAL_CONFIG.legalAddress}, es el responsable del tratamiento de los datos personales suministrados por los usuarios en el sitio web, en estricto cumplimiento de la Ley N° 25.326 de Protección de los Datos Personales y sus normas complementarias.`
  },
  {
    id: 'datos-recopilados',
    title: '2. Datos Personales Recopilados y Finalidad',
    content: `Recopilamos únicamente los datos necesarios para la operatoria comercial:
- Nombre y apellido completos.
- Número de documento / CUIT (en caso de emisión de factura).
- Dirección postal y código postal (para el despacho logístico).
- Teléfono de contacto / WhatsApp (para coordinación y aviso de despacho).
- Dirección de correo electrónico (para envío de confirmaciones y enlaces de seguimiento).

Finalidad: La recolección de estos datos tiene como único objeto procesar las órdenes de compra, coordinar los envíos, prestar servicio de posventa y cumplir con obligaciones fiscales y de defensa del consumidor. En ningún caso comercializamos, alquilamos ni cedemos bases de datos personales a terceros con fines de comercialización masiva o publicidad no solicitada.`
  },
  {
    id: 'seguridad-terceros',
    title: '3. Proveedores de Servicios y Medidas de Seguridad',
    content: `Para la prestación eficiente del servicio, compartimos datos estrictamente pertinentes con:
- Procesadores de pago (Mercado Pago): Quienes procesan de forma cifrada los datos de pago bajo estándares PCI-DSS. ${LEGAL_CONFIG.storeName} nunca almacena números completos de tarjetas de crédito o débito ni códigos de seguridad CVV.
- Empresas de Logística (Correo Argentino / Andreani): Para la confección de las guías de transporte y entrega física.
- Infraestructura en la nube (Supabase Inc.): Para almacenamiento seguro bajo estrictas políticas de acceso restringido y encriptación en tránsito.

Implementamos las medidas de seguridad técnicas y organizativas exigidas por la Resolución AAIP 47/2018 para evitar la adulteración, pérdida, consulta o tratamiento no autorizado de la información.`
  },
  {
    id: 'derechos-arco',
    title: '4. Derechos de Acceso, Rectificación, Actualización y Supresión (ARCO)',
    content: `Los titulares de los datos tienen derecho a solicitar el acceso, rectificación, actualización o supresión de sus datos personales almacenados en nuestros registros de forma gratuita. Para ejercer estos derechos, el titular deberá enviar una solicitud por escrito al correo electrónico oficial: ${LEGAL_CONFIG.contactEmail}, acreditando su identidad.

Advertencia Legal Obligatoria: "El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley Nº 25.326. La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, Órgano de Control de la Ley Nº 25.326, tiene la atribución de atender las denuncias y reclamos que se interpongan con relación al incumplimiento de las normas sobre protección de datos personales."`
  }
];

export const RETURNS_AND_EXCHANGES_POLICY: LegalSection[] = [
  {
    id: 'arrepentimiento-legal',
    title: '1. Derecho de Arrepentimiento / Revocación Legal (Días 1 a 10)',
    content: `Conforme a lo dispuesto por el Artículo 34 de la Ley 24.240 de Defensa del Consumidor, el Artículo 1110 del Código Civil y Comercial de la Nación y la Resolución 424/2020 de la Secretaría de Comercio Interior:

- Plazo: El comprador tiene derecho irrenunciable a revocar la compra durante el plazo de diez (10) días corridos contados a partir de la fecha de recepción efectiva de la prenda.
- Costo de Devolución: Los gastos de envío vinculados a la devolución corren por cuenta exclusiva de ${LEGAL_CONFIG.storeName}. El ejercicio del arrepentimiento no generará gasto alguno para el consumidor.
- Reembolso: El reintegro abarcará el cien por ciento (100%) del importe abonado por la prenda y el envío original (en caso de haberse cobrado flete), ejecutándose por el mismo medio de pago dentro del plazo legal.
- Cómo solicitarlo: Haciendo clic en el "Botón de Arrepentimiento" ubicado en el pie de página de la tienda, completando el formulario mínimo. El sistema emitirá un código de identificación de revocación de forma inmediata.`
  },
  {
    id: 'cambios-voluntarios',
    title: '2. Política Comercial de Cambios Voluntarios (Días 11 a 30)',
    content: `Vencido el plazo legal de arrepentimiento de 10 días, ${LEGAL_CONFIG.storeName} brinda una política comercial de cambio extendida hasta el día treinta (30) corrido desde la entrega del producto:

- Naturaleza 1/1: Dado que comercializamos prendas únicas sin stock de duplicados ni talles repetidos, el cambio se efectuará por cualquier otra prenda disponible en el catálogo activo (abonando la diferencia si la nueva prenda fuere de mayor valor, o recibiendo el reembolso si fuere menor) o, a elección del cliente, mediante la emisión de un Cupón/Voucher de Crédito sin vencimiento por el valor total de la prenda devuelta.
- Costo de Envío: En los cambios comerciales voluntarios realizados entre los días 11 y 30, el costo del flete de devolución y del nuevo despacho correrá por cuenta del comprador.`
  },
  {
    id: 'condicion-admision',
    title: '3. Condiciones Indispensables de Admisión de las Prendas',
    content: `Para que proceda cualquier devolución o cambio (tanto dentro del plazo legal de 10 días como en el comercial de 30 días), la prenda devuelta debe cumplir con los siguientes requisitos indispensables de conservación:

a) Debe encontrarse en el mismo estado en que fue enviada, sin signos de uso posterior a la prueba de talle.
b) No debe presentar manchas de maquillaje, desodorante, perfume, tintura ni olores corporales ajenos al tratamiento de curaduría.
c) No debe haber sido lavada, planchada ni modificada en su costura o estructura original.
d) Debe conservar intacto su precinto o etiqueta identificatoria original.

Protocolo de Inspección: Tras recibir físicamente la pieza devuelta, ${LEGAL_CONFIG.storeName} dispondrá de un plazo de cuarenta y ocho (48) a setenta y dos (72) horas hábiles para realizar la auditoría técnica de la prenda. Verificada la conformidad, se procederá inmediatamente al reembolso o a la activación del cupón correspondiente.`
  },
  {
    id: 'garantia-usados',
    title: '4. Garantía Legal de Cosas Muebles Usadas (90 Días)',
    content: `Conforme al Artículo 11 de la Ley 24.240, las cosas muebles usadas gozan de una garantía legal obligatoria de tres (3) meses (90 días corridos) a partir de la entrega.

Esta garantía cubre de manera exclusiva vicios ocultos, defectos de funcionamiento no advertidos o fallas estructurales graves que impidan el uso ordinario de la prenda y que no hubieren sido expresamente descriptos ni fotografiados en la ficha de publicación del producto. En caso de vicio oculto cubierto por garantía, los costos de reparación, reposición equivalente o restitución íntegra de fondos son asumidos por la tienda.`
  }
];

export const TRADEMARK_DISCLAIMER: LegalSection = {
  id: 'disclaimer-marcas',
  title: 'Aviso Legal sobre Marcas Registradas de Terceros (Agotamiento Marcario)',
  content: `${LEGAL_CONFIG.storeName} es un emprendimiento y tienda digital independiente dedicada a la curaduría y comercialización de indumentaria circular, prendas vintage y de segunda mano. 

Todas las marcas comerciales, nombres comerciales, logotipos, emblemas e imagotipos de terceros (tales como Levi's®, Nike®, Adidas®, Tommy Hilfiger®, Polo Ralph Lauren®, Zara®, entre otras) que pudieran figurar en las prendas exhibidas pertenecen exclusiva y legalmente a sus respectivos titulares registrales.

La exhibición de dichas marcas en el catálogo de ${LEGAL_CONFIG.storeName} tiene fines estrictamente descriptivos y de identificación del producto original puesto en el comercio legal, amparada por el principio de agotamiento de los derechos de marca. ${LEGAL_CONFIG.storeName} no es licenciatario, distribuidor oficial, franquiciado, agente autorizado ni cuenta con patrocinio o relación jurídica o comercial alguna con los titulares de dichas marcas.`
};
