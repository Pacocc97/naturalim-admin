import { Table, Container, Heading } from '@medusajs/ui';
import { useEffect, useState } from 'react';
import { defineRouteConfig } from '@medusajs/admin-sdk';
import { TagSolid } from '@medusajs/icons';

const BrandsPage = () => {
  const [brands, setBrands] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    fetch(`/admin/brands`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then(({ brands: brandsData }) => {
        setBrands(brandsData);
      });
  }, []);

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Brands</Heading>
      </div>
      <div className="flex h-full flex-col overflow-hidden !border-t-0">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {brands.map((brand) => (
              <Table.Row key={brand.id}>
                <Table.Cell>{brand.id}</Table.Cell>
                <Table.Cell>{brand.name}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </Container>
  );
};

export default BrandsPage;

export const config = defineRouteConfig({
  label: 'Brands',
  icon: TagSolid,
});
