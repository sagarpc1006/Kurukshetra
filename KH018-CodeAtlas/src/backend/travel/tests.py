from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status


class DiscoverRealtimePlacesTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_01_discover_default_places(self):
        response = self.client.get('/api/discover/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertTrue(data.get('success'))
        self.assertGreater(data.get('count', 0), 5)
        places = data.get('places', [])
        # Check first place has real-time fields
        p = places[0]
        self.assertIn('name', p)
        self.assertIn('weather', p)
        self.assertIn('temperature', p['weather'])
        self.assertIn('official_links', p)
        self.assertIn('eco_score', p)

    def test_02_discover_category_filtering(self):
        response = self.client.get('/api/discover/?category=Beach')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        names = [p['name'] for p in data.get('places', [])]
        self.assertIn('Goa', names)
        self.assertIn('Alleppey', names)

    def test_03_discover_accessible_filtering(self):
        response = self.client.get('/api/discover/?category=♿ Accessible')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        names = [p['name'] for p in data.get('places', [])]
        self.assertIn('Munnar', names)
        self.assertIn('Coorg', names)

    def test_04_discover_search_specific_destination(self):
        response = self.client.get('/api/discover/?search=Tirupati')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertGreaterEqual(data.get('count', 0), 1)
        p = data['places'][0]
        self.assertEqual(p['name'], 'Tirupati')
        self.assertTrue(p.get('has_official_package'))
        self.assertIsNotNone(p.get('official_package'))
        self.assertIn('ttdevasthanams.ap.gov.in', p['official_package']['url'])

    def test_05_discover_dynamic_search_unknown_destination(self):
        response = self.client.get('/api/discover/?search=Udaipur')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertGreaterEqual(data.get('count', 0), 1)
        p = data['places'][0]
        self.assertEqual(p['name'], 'Udaipur')
        self.assertIn('weather', p)
        self.assertIn('official_links', p)

    def test_06_discover_detail_view(self):
        response = self.client.get('/api/discover/munnar/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertTrue(data.get('success'))
        place = data.get('place')
        self.assertEqual(place['name'], 'Munnar')
        self.assertIn('weather', place)
        self.assertIn('temperature', place['weather'])
        self.assertIn('highlights', place)
