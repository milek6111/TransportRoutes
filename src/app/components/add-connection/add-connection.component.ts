import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Neo4jService } from '../../services/neo4j.service';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-connection',
  standalone: true,
  imports: [MatCard, MatCardTitle, MatCardContent, MatFormField, MatInput, MatSelectModule, MatButtonModule, ReactiveFormsModule, CommonModule],
  templateUrl: './add-connection.component.html',
  styleUrls: ['./add-connection.component.css']
})
export class AddConnectionComponent implements OnInit {
  connectionForm: FormGroup;
  cities: string[] = [];
  transportTypes = ['KOMUNIKACJA_DROGOWA', 'LOTY', 'TRASA_MORSKA'];

  constructor(private fb: FormBuilder, private neo4jService: Neo4jService) {
    this.connectionForm = this.fb.group({
      fromCity: ['', Validators.required],
      toCity: ['', Validators.required],
      transportType: ['', Validators.required],
      distance: [null, Validators.min(0)],
      travelTime: [null, Validators.min(0)],
      flightTime: [null, Validators.min(0)],
      cost: [null, Validators.min(0)],
      airline: [''],
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

  async addConnection(): Promise<void> {
    if (this.connectionForm.valid) {
      const connectionData = this.connectionForm.value;

      try {
        await this.neo4jService.addConnection(connectionData);
        alert(`Połączenie między "${connectionData.fromCity}" a "${connectionData.toCity}" zostało dodane.`);
        this.connectionForm.reset();
      } catch (error) {
        console.error('Błąd podczas dodawania połączenia:', error);
        alert('Wystąpił błąd podczas dodawania połączenia.');
      }
    } else {
      alert('Proszę wypełnić wymagane pola.');
    }
  }
}
