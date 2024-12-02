import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Neo4jService } from '../../services/neo4j.service';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatFormField } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-node',
  standalone: true,
  imports: [MatCard, MatCardTitle, MatCardContent, MatFormField, MatSelectModule, MatButtonModule, ReactiveFormsModule, CommonModule],
  templateUrl: './delete-node.component.html',
  styleUrls: ['./delete-node.component.css']
})
export class DeleteNodeComponent implements OnInit {
  deleteForm: FormGroup;
  cities: string[] = [];

  constructor(private fb: FormBuilder, private neo4jService: Neo4jService) {
    this.deleteForm = this.fb.group({
      cityName: ['', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadCities();
  }

  async loadCities(): Promise<void> {
    try {
      const data = await this.neo4jService.fetchCities();
      this.cities = data;
    } catch (error) {
      console.error('Błąd podczas ładowania miast:', error);
    }
  }

  async deleteNode(): Promise<void> {
    if (this.deleteForm.valid) {
      const cityName = this.deleteForm.value.cityName;

      try {
        await this.neo4jService.deleteCity(cityName);
        alert(`Miasto "${cityName}" oraz jego połączenia zostały usunięte.`);
        this.deleteForm.reset();
        await this.loadCities(); // Odśwież listę miast po usunięciu
      } catch (error) {
        console.error('Błąd podczas usuwania węzła:', error);
        alert('Wystąpił błąd podczas usuwania węzła.');
      }
    } else {
      alert('Proszę wybrać miasto.');
    }
  }
}
